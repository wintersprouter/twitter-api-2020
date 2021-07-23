const db = require('../models')
const { User, Tweet, Reply, Like, Followship } = db
const validator = require('validator')
const bcrypt = require('bcryptjs')
const helpers = require('../_helpers')
const imgur = require('imgur-node-api')
const IMGUR_CLIENT_ID = process.env.IMGUR_CLIENT_ID
const organizeData = require('../utils/organizeData')
const { getSignInData } = organizeData

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
      return callback(getSignInUser)
    } catch (err) {
      console.log(err)
    }
  },
  signUp: async (req, res, callback) => {
    try {
      const { account, name, email, password, checkPassword } = req.body
      const message = []
      // check all inputs are required
      if (!account || !name || !email || !password || !checkPassword) {
        message.push('All fields are required！')
      }
      // check name length and type
      if (name && !validator.isByteLength(name, { min: 0, max: 50 })) {
        message.push('Name can not be longer than 50 characters.')
      }
      // check account length and type
      if (account && !validator.isByteLength(account, { min: 0, max: 20 })) {
        message.push('Account can not be longer than 20 characters.')
      }
      // check email validation
      if (email && !validator.isEmail(email)) {
        message.push(`${email} is not a valid email address.`)
      }
      // check password length and type
      if (password && !validator.isByteLength(password, { min: 5, max: 15 })) {
        message.push('Password does not meet the required length.')
      }
      // check password and checkPassword
      if (password && (password !== checkPassword)) {
        message.push('The password and confirmation do not match.Please retype them.')
      }
      const [inputEmail, inputAccount] = await Promise.all([User.findOne({ where: { email } }), User.findOne({ where: { account } })])
      if (inputEmail) {
        message.push('This email address is already being used.')
      }
      if (inputAccount) {
        message.push('This account is already being used.')
      }
      if (message.length) {
        return callback({ status: 'error', message })
      }
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
  }

}
module.exports = userService
