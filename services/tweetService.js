const db = require('../models')
const { Tweet, User, Like, Reply } = db
const validator = require('validator')
const organizeData = require('../utils/organizeData')
const { getTweetData, getTweetsData } = organizeData
const tweetService = {
  getTweets: async (req, res, callback) => {
    try {
      const tweets = await Tweet.findAll({
        include: [
          User,
          Reply,
          Like,
          { model: User, as: 'LikedUsers' }
        ],
        order: [['createdAt', 'DESC']]
      })
      if (!tweets) {
        return callback({ status: 'error', message: 'Cannot find any tweets in db.' })
      }
      const tweetsData = await getTweetsData(req, tweets)
      tweetsData.status = 'success'
      return callback(tweetsData)
    } catch (err) {
      console.log(err)
    }
  },
  getTweet: async (req, res, callback) => {
    try {
      const id = req.params.tweet_id
      let tweet = await Tweet.findByPk(id,
        {
          include: [
            User,
            Like,
            Reply,
            { model: User, as: 'LikedUsers' }]
        })
      if (!tweet) {
        return callback({ status: 'error', message: 'Cannot find this tweet in db.' })
      }
      tweet = tweet.toJSON()
      const tweetData = await getTweetData(req, tweet)
      return callback(tweetData)
    } catch (err) {
      console.log(err)
    }
  },
  postTweet: async (req, res, callback) => {
    try {
      const { description } = req.body
      if (!description) {
        return callback({ status: 'error', message: 'Please input tweet.' })
      }
      if (description && !validator.isByteLength(description, { min: 0, max: 140 })) {
        return callback({ status: 'conflict', message: 'Tweet can\'t be more than 140 words.' })
      }
      await Tweet.create({
        UserId: req.user.id,
        description
      })
      return callback({ status: 'success', message: 'The tweet was successfully created.' })
    } catch (err) {
      console.log(err)
    }
  }

}
module.exports = tweetService
