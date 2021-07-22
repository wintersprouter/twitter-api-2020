const db = require('../models')
const { User, Tweet, Like } = db
const organizeData = require('../utils/organizeData')
const { getUsersData } = organizeData

const adminService = {
  getUsers: async (req, res, callback) => {
    try {
      let users = await User.findAll({
        include: [
          { model: Tweet, include: [Like] },
          { model: User, as: 'Followings' },
          { model: User, as: 'Followers' }]
      })
      if (!users) {
        return callback({ status: 'error', message: 'Cannot find any users in db.' })
      }
      const usersData = await getUsersData(req, users)
  
      return callback(usersData)
    } catch (err) {
      console.log(err)
    }
  },
  deleteTweet: async (req, res, callback) => {
    try {
      const id = req.params.id
      const tweet = await Tweet.findByPk(id, { include: [User] })
      if (!tweet) { return callback({ status: 'error', message: 'This tweet doesn\'t exist!' }) }
      const tweetAuthor = tweet.dataValues.User.dataValues.account
      await tweet.destroy()
      return callback({ status: 'success', message: `@${tweetAuthor}'s tweet has been deleted!` })
    } catch (err) {
      console.log(err)
    }
  }
}
module.exports = adminService
