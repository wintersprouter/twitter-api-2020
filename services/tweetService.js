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
      tweetData.status = 'success'
      tweetData.message = 'Get the tweet successfully'
      return callback(tweetData)
    } catch (err) {
      console.log(err)
    }
  }

}
module.exports = tweetService
