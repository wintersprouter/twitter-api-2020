const db = require('../models')
const { User, Tweet, Reply, Like, Followship } = db
const validator = require('validator')
const bcrypt = require('bcryptjs')
const helpers = require('../_helpers')
const imgur = require('imgur-node-api')
const IMGUR_CLIENT_ID = process.env.IMGUR_CLIENT_ID
const organizeData = require('../utils/organizeData')
const { getSignInData, getCurrentUserData, getTopUsersData, getUserData, getTweetsData, getUserLikesData, getRepliesData } = organizeData
const fromValidation = require('../utils/formValidation')
const { checkUserInfoEdit, checkUserInfo, checkUserProfileEdit } = fromValidation

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
const userService = {
  signIn: async (req, res, callback) => {
    try {
      // check all inputs are required
      const { account, password } = req.body
      if (!account || !password) {
        return callback({ status: 'error: bad request', message: 'All fields are required!' })
      }
      const user = await User.findOne({ where: { account } })
      if (!user) return callback({ status: 'error: unauthorized:', message: 'That account is not registered!' })
      if (!bcrypt.compareSync(password, user.password)) {
        return callback({ status: 'error: unauthorized', message: 'Account or Password incorrect.' })
      }
      const payload = { id: user.id }
      const token = jwt.sign(payload, process.env.JWT_SECRET)
      await getSignInData(token, user)
      return callback(user)
    } catch (err) {
      console.log(err)
    }
  },
  signUp: async (req, res, callback) => {
    try {
      const message = []
      await checkUserInfo(req, message)

      if (message.length) {
        return callback({ status: 'error', message })
      }
      const { account, name, email, password } = req.body
      await User.create({
        account,
        name,
        email,
        password: bcrypt.hashSync(password, bcrypt.genSaltSync(10), null)
      })
      return callback({ status: 'success', message: `@${account} sign up successfully.Please sign in.` })
    } catch (err) {
      console.log(err)
    }
  },
  getCurrentUser: async (req, res, callback) => {
    try {
      const currentUser = await getCurrentUserData(req)
      return callback(currentUser)
    } catch (err) {
      console.log(err)
    }
  },
  getTopUsers: async (req, res, callback) => {
    try {
      const users = await User.findAll({
        where: { role: 'user' },
        include: [
          { model: User, as: 'Followers' }
        ],
        limit: 10
      })
      if (!users) {
        return callback({ status: 'error', message: 'Cannot find any user in db.' })
      }
      const usersData = await getTopUsersData(req, users)
      return callback(usersData)
    } catch (err) {
      console.log(err)
    }
  },
  editAccount: async (req, res, callback) => {
    try {
      const { account, name, email, password } = req.body
      const id = req.params.id
      await checkUserInfoEdit
      // only user himself allow to edit account
      if (req.user.id !== Number(id)) {
        return res.status(401).json({ status: 'error: unauthorized', message: 'Permission denied.' })
      }
      // check this user is or not in db
      const user = await User.findByPk(id)
      if (!user || user.role === 'admin') {
        return callback({ status: 'error: not found', message: 'Cannot find this user in db.' })
      }
      const message = []
      await checkUserInfoEdit(req, message)
      if (message.length) {
        return callback({ status: 'error: bad request', message })
      }
      await user.update({ name, password: bcrypt.hashSync(password, bcrypt.genSaltSync(10)), email, account })
      return callback({ status: 'success', message: `@${account} Update account information successfully.` })
    } catch (err) {
      console.log(err)
    }
  },
  getUser: async (req, res, callback) => {
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
      if (!user || user.role === 'admin') {
        return callback({ status: 'error', message: 'Cannot find this user in db.' })
      }
      const userData = await getUserData(req, user)
      return callback(userData)
    } catch (err) {
      console.log(err)
    }
  },
  editUserProfile: async (req, res, callback) => {
    try {
      const id = req.params.id
      const { name, introduction } = req.body
      const message = []
      // only user himself allow to edit account
      if (req.user.id !== Number(id)) {
        return callback({ status: 'error: unauthorized', message: 'Permission denied.' })
      }
      // check this user is or not in db
      const user = await User.findByPk(id)
      if (!user || user.role === 'admin') {
        return callback({ status: 'error: not found', message: 'Cannot find this user in db.' })
      }
      await checkUserProfileEdit(req, message)
      if (message.length) {
        return callback({ status: 'error: bad request', message })
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
            return callback({ status: 'error: bad request', message: `Image type of ${file} should be .jpg, .jpeg, .png .` })
          }
        }
      }
      await user.update(updateData)
      return callback({ status: 'success', message: `Update ${name}'s profile successfully.` })
    } catch (err) {
      console.log(err)
    }
  },
  getUserTweets: async (req, res, callback) => {
    try {
      const UserId = req.params.id
      const user = await User.findByPk(UserId)
      if (!user || user.role === 'admin') {
        return callback({ status: 'error: not found', message: 'Cannot find this user in db.' })
      }
      const tweets = await Tweet.findAll({
        where: { UserId },
        include: [
          User,
          Reply,
          Like,
          { model: User, as: 'LikedUsers' }
        ],
        order: [['createdAt', 'DESC']]
      })
      if (!tweets) {
        return callback({ status: 'error: not found', message: 'Cannot find any tweets in db.' })
      }
      const tweetsData = await getTweetsData(req, tweets)
      return callback(tweetsData)
    } catch (err) {
      console.log(err)
    }
  },
  getUserLikes: async (req, res, callback) => {
    try {
      const UserId = req.params.id
      const user = await User.findByPk(UserId)
      if (!user || user.role === 'admin') {
        return callback({ status: 'error: not found', message: 'Cannot find this user in db.' })
      }
      const likes = await Like.findAll({
        where: { UserId },
        include: [{
          model: Tweet,
          include: [{ model: User },
            { model: Reply, include: [{ model: User }] }, Like]
        }],
        order: [['createdAt', 'DESC']]
      })
      if (!likes) {
        return callback({ status: 'error: not found', message: 'Cannot find any liked tweets in db.' })
      }
      const likesData = await getUserLikesData(req, likes)
      return callback(likesData)
    } catch (err) {
      console.log(err)
    }
  },
  getUserReplies: async (req, res, callback) => {
    try {
      const UserId = req.params.id
      const user = await User.findByPk(UserId)
      if (!user || user.role === 'admin') {
        return callback({ status: 'error: not found', message: 'Cannot find this user in db.' })
      }

      const replies = await Reply.findAll({
        where: { UserId },
        include: [User, { model: Tweet, include: User }],
        order: [['createdAt', 'DESC']]
      })

      if (!replies) {
        return callback({ status: 'error: not found', message: 'Cannot find any replies in db.' })
      }

      const repliesData = await getRepliesData(replies)
      return callback(repliesData)
    } catch (err) {
      console.log(err)
    }
  }

}
module.exports = userService
