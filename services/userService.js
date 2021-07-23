const db = require('../models')
const { User, Tweet, Reply, Like, Followship } = db
const validator = require('validator')
const bcrypt = require('bcryptjs')
const helpers = require('../_helpers')
const imgur = require('imgur-node-api')
const IMGUR_CLIENT_ID = process.env.IMGUR_CLIENT_ID
const organizeData = require('../utils/organizeData')
const { getSignInData } = organizeData
const fromValidation = require('../utils/fromValidation')
const { checkUserInfo } = fromValidation

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
      await getCurrentUserData(req)
      return callback(req)
    } catch (err) {
      console.log(err)
    }
  }

}
module.exports = userService
