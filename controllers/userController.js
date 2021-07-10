const db = require('../models')
const { User, Tweet, Reply, Like, Followship } = db
const validator = require('validator')
const { formValidation } = require('../config/functions')
const bcrypt = require('bcryptjs')
const imgur = require('imgur-node-api')
const IMGUR_CLIENT_ID = process.env.IMGUR_CLIENT_ID

const uploadImg = path => {
  return new Promise((resolve, reject) => {
    imgur.upload(path, (err, img) => {
      if (err) {
        return reject('error happened')
      }
      resolve(img)
    })
  })
}

// JWT
const jwt = require('jsonwebtoken')
const passportJWT = require('passport-jwt')
const ExtractJwt = passportJWT.ExtractJwt
const JwtStrategy = passportJWT.Strategy

const userController = {
  signIn: async (req, res) => {
    try {
      // check all inputs are required
      const { account, password } = req.body
      if (!account || !password) {
        return res.status(422).json({ status: 'error', message: 'All fields are required!' })
      }
      const user = await User.findOne({ where: { account } })
      if (!user) return res.status(401).json({ status: 'error', message: 'That account is not registered!' })
      if (!bcrypt.compareSync(password, user.password)) {
        return res.status(401).json({ status: 'error', message: 'Account or Password incorrect.' })
      }
      const payload = { id: user.id }
      const token = jwt.sign(payload, process.env.JWT_SECRET)
      return res.status(200).json({
        status: 'success',
        message: 'Sign in successfully.',
        token: token,
        user: {
          id: user.id,
          account: user.account,
          email: user.email,
          name: user.name,
          avatar: user.avatar,
          cover: user.cover,
          role: user.role
        }
      })
    } catch (err) {
      console.log(err)
      res.status(500).json({ status: 'error', message: 'error' })
    }
  },
  signUp: async (req, res) => {
    try {
      const { account, name, email, password, checkPassword } = req.body
      const message = []
      formValidation(account, name, email, password, checkPassword)
      const [inputEmail, inputAccount] = await Promise.all([User.findOne({ where: { email } }), User.findOne({ where: { account } })])
      if (inputEmail) {
        message.push('This email address is already being used.')
      }
      if (inputAccount) {
        message.push('This account is already being used.')
      }
      if (message.length) {
        return res.status(400).json({ status: 'error', message })
      }
      await User.create({
        account,
        name,
        email,
        password: bcrypt.hashSync(password, bcrypt.genSaltSync(10), null)
      })
      return res.status(200).json({ status: 'success', message: `@${account} Sign up successfully.Please sign in.` })
    } catch (err) {
      console.log(err)
      res.status(500).json({ status: 'error', message: 'error' })
    }
  },
  getCurrentUser: (req, res) => {
    return res.status(200).json({
      id: req.user.id,
      name: req.user.name,
      account: req.user.account,
      email: req.user.email,
      avatar: req.user.avatar,
      role: req.user.role,
      cover: req.user.cover,
      introduction: req.user.introduction
    })
  },
  getTopUsers: async (req, res) => {
    try {
      let users = await User.findAll({
        where: { role: 'user' },
        include: [
          { model: User, as: 'Followers' }
        ],
        limit: 10
      })
      if (!users) {
        return res.status(404).json({ status: 'error', message: 'Cannot find any user in db.' })
      }
      users = users.map(user => ({
        id: user.id,
        name: user.name,
        avatar: user.avatar,
        account: user.account,
        followerCount: user.Followers.length,
        isFollowed: req.user.Followings.map(d => d.id).includes(user.id)
      }))
      users = users.sort((a, b) => b.followerCount - a.followerCount)
      return res.status(200).json({
        status: 'success',
        message: 'Get top ten users successfully',
        users
      })
    } catch (err) {
      console.log(err)
      res.status(500).json({ status: 'error', message: 'error' })
    }
  },
  editAccount: async (req, res) => {
    try {
      const { account, name, email, password, checkPassword } = req.body
      const { email: currentEmail, account: currentAccount } = req.user
      const id = req.params.id
      // only user himself allow to edit account
      if (req.user.id !== Number(id)) {
        return res.status(401).json({ status: 'error', message: 'Permission denied.' })
      }
      // check this user is or not in db
      const user = await User.findByPk(id)
      if (!user) {
        return res.status(404).json({ status: 'error', message: 'Cannot find this user in db.' })
      }
      if (user.role === 'admin') {
        return res.status(400).json({ status: 'error', message: 'Admin is not allowed to edit account.' })
      }
      const message = []
      formValidation(account, name, email, password, checkPassword)
      if (email !== currentEmail) {
        const userEmail = await User.findOne({ where: { email } })
        if (userEmail) {
          message.push('This email address is already being used.')
        }
      }
      if (account !== currentAccount) {
        const userAccount = await User.findOne({ where: { account } })
        if (userAccount) {
          message.push('This account is already being used.')
        }
      }
      if (message.length) {
        return res.status(400).json({ status: 'error', message })
      }
      await user.update({ name, password: bcrypt.hashSync(password, bcrypt.genSaltSync(10)), email, account })
      return res.status(200).json({ status: 'success', message: `@${account} Update account information successfully.` })
    } catch (err) {
      console.log(err)
      res.status(500).json({ status: 'error', message: 'error' })
    }
  },
  getUser: async (req, res) => {
    try {
      const id = req.params.id
      const user = await User.findOne({
        where: {
          id: id

        },
        include: [
          { model: Tweet },
          { model: User, as: 'Followers' },
          { model: User, as: 'Followings' }
        ]
      })
      if (!user) {
        return res.status(404).json({ status: 'error', message: 'Cannot find this user in db.' })
      }
      if (user.role === 'admin') {
        return res.status(400).json({ status: 'error', message: 'Cannot view admin.' })
      }
      const data = {
        status: 'success',
        message: `Get @${user.account}'s  profile successfully.`,
        id: user.dataValues.id,
        name: user.dataValues.name,
        account: user.account,
        email: user.email,
        avatar: user.avatar,
        cover: user.cover,
        introduction: user.introduction,
        tweetCount: user.Tweets.length,
        followerCount: user.Followers.length,
        followingCount: user.Followings.length,
        isFollowed: user.Followers.map(d => d.id).includes(req.user.id)
      }
      return res.status(200).json(
        data
      )
    } catch (err) {
      console.log(err)
      res.status(500).json({ status: 'error', message: 'error' })
    }
  },
  editUserProfile: async (req, res) => {
    try {
      const id = req.params.id
      const { name, introduction } = req.body
      const message = []
      // only user himself allow to edit account
      if (req.user.id !== Number(id)) {
        return res.status(401).json({ status: 'error', message: 'Permission denied.' })
      }
      // check this user is or not in db
      const user = await User.findByPk(id)
      if (!user) {
        return res.status(404).json({ status: 'error', message: 'Cannot find this user in db.' })
      }
      if (user.role === 'admin') {
        return res.status(400).json({ status: 'error', message: 'Admin is not allowed to edit profile.' })
      }
      // check Name is required
      if (!name) {
        message.push('Name is required.')
      }
      // check name length and type
      if (name && !validator.isByteLength(name, { min: 0, max: 50 })) {
        message.push('Name can not be longer than 50 characters.')
      }
      // check introduction length and type
      if (introduction && !validator.isByteLength(introduction, { min: 0, max: 160 })) {
        message.push('Introduction can not be longer than 160 characters.')
      }
      if (message.length) {
        return res.status(400).json({ status: 'error', message })
      }
      const updateData = { name, introduction }
      const { files } = req
      const imgType = ['.jpg', '.jpeg', '.png']
      if (files) {
        imgur.setClientID(IMGUR_CLIENT_ID)
        for (const file in files) {
          const index = files[file][0].originalname.lastIndexOf('.')
          const fileType = files[file][0].originalname.slice(index)
          if (imgType.includes(fileType)) {
            const img = await uploadImg(files[file][0].path)
            updateData[file] = img.data.link
          } else {
            return res.status(400).json({ status: 'error', message: `Image type of ${file} should be .jpg, .jpeg, .png .` })
          }
        }
      }
      await user.update(updateData)
      return res.status(200).json({ status: 'success', message: `Update ${name}'s profile successfully.` })
    } catch (err) {
      console.log(err)
      res.status(500).json({ status: 'error', message: 'error' })
    }
  },

  getUserTweets: (req, res) => {
    return Tweet.findAll({
      where: { UserId: req.params.id },
      order: [['createdAt', 'DESC']],
      raw: true,
      nest: true
    })
      .then(tweets => {
        return res.status(200).json(tweets)
      })
      .catch(error => {
        console.log('error')
        res.status(500).json({ status: 'error', message: 'error' })
      })
  },
  getUserReplies: (req, res) => {
    return Reply.findAll({
      where: { UserId: req.params.id },
      include: { model: Tweet },
      order: [['createdAt', 'DESC']],
      raw: true,
      nest: true
    })
      .then(replies => {
        return res.status(200).json(replies)
      })
      .catch(error => {
        console.log('error')
        res.status(500).json({ status: 'error', message: 'error' })
      })
  },
  getUserLikes: (req, res) => {
    return Like.findAll({
      where: { UserId: req.params.id },
      include: { model: Tweet },
      order: [['createdAt', 'DESC']],
      raw: true,
      nest: true
    })
      .then(likes => {
        return res.status(200).json(likes)
      })
      .catch(error => {
        console.log('error')
        res.status(500).json({ status: 'error', message: 'error' })
      })
  },
  getUserFollowings: (req, res) => {
    return Followship.findAll({
      where: { followerId: req.params.id },
      order: [['createdAt', 'DESC']],
      raw: true,
      nest: true
    })
      .then(followings => {
        return res.status(200).json(followings)
      })
      .catch(error => {
        console.log('error')
        res.status(500).json({ status: 'error', message: 'error' })
      })
  },
  getUserFollowers: (req, res) => {
    return Followship.findAll({
      where: { followingId: req.params.id },
      order: [['createdAt', 'DESC']],
      raw: true,
      nest: true
    })
      .then(followers => {
        return res.status(200).json(followers)
      })
      .catch(error => {
        console.log('error')
        res.status(500).json({ status: 'error', message: 'error' })
      })
  }
}

module.exports = userController
