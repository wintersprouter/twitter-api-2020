const db = require('../models')
const { User, Tweet, Like } = db
const adminService = require('../services/adminService')

const adminController = {
  getUsers: async (req, res, next) => {
    // #swagger.tags = ['Admin']
    // #swagger.description = 'Get users data.'
    try {
      adminService.getUsers(req, res, data => {
        if (data.status && data.status === 'error') {
          return res.status(404).json(data.message)
        }
        return res.status(200).json(data)
      })
    } catch (err) {
      next(err)
    }
  },
  deleteTweet: async (req, res, next) => {
    // #swagger.tags = ['Admin']
    // #swagger.description = 'Delete a tweet.'
    try {
      const id = req.params.id
      const tweet = await Tweet.findByPk(id, { include: [User] })
      if (!tweet) { return res.status(401).json({ status: 'error', message: 'This tweet doesn\'t exist!' }) }
      const tweetAuthor = tweet.dataValues.User.dataValues.account
      await tweet.destroy()
      console.log(tweetAuthor)
      return res.status(200).json({ status: 'success', message: `@${tweetAuthor}'s tweet has been deleted!` })
    } catch (err) {
      next(err)
    }
  }
}

module.exports = adminController
