const db = require('../models')
const { Tweet, User, Like, Reply } = db
const validator = require('validator')
const organizeData = require('../utils/organizeData')
const { getTweetData, getTweetsData, getRepliesData } = organizeData
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
  },
  getReplies: async (req, res, callback) => {
    try {
      const TweetId = await User.findOne({
        where: {
          id: req.params.tweet_id,
          role: 'user'
        }
      })
      if (!TweetId) {
        return callback({ status: 'error', message: 'Cannot find this tweet in db.' })
      }
      const replies = await Reply.findAll({
        where: { TweetId: req.params.tweet_id },
        include: [User, { model: Tweet, include: User }],
        order: [['createdAt', 'DESC']]
      })
      if (!replies) {
        return callback({ status: 'error', message: 'Cannot find any replies in db.' })
      }
      const repliesData = await getRepliesData(req, replies)
      repliesData.status = 'success'
      return callback(repliesData)
    } catch (err) {
      console.log(err)
    }
  },
  postReply: async (req, res, callback) => {
    try {
      const TweetId = req.params.tweet_id
      const repliedTweet = await Tweet.findByPk(TweetId, { include: [User] })
      if (!repliedTweet) {
        return callback({ status: 'error', message: 'Cannot find this tweet in db.' })
      }
      const repliedTweetAuthor = repliedTweet.dataValues.User.dataValues.account
      const { comment } = req.body
      if (!comment) {
        return callback({ status: 'bad request', message: 'Please input comment.' })
      }
      if (comment && !validator.isByteLength(comment, { min: 0, max: 50 })) {
        return callback({ status: 'conflict', message: 'Comment can\'t be more than 50 words.' })
      }
      await Reply.create({
        UserId: req.user.id,
        TweetId,
        comment
      })
      return callback({ status: 'success', message: `You replied @${repliedTweetAuthor}'s tweet successfully.` })
    } catch (err) {
      console.log(err)
    }
  },
  postLike: async (req, res, callback) => {
    try {
      const TweetId = req.params.id
      const UserId = req.user.id
      const likedTweet = await Tweet.findByPk(
        req.params.id, { include: [User] }
      )
      if (!likedTweet) {
        return callback({ status: 'error', message: 'Cannot find this tweet in db.' })
      }
      const likedTweetAuthor = likedTweet.dataValues.User.dataValues.account
      const liked = await Like.findOne({
        where: { UserId, TweetId }
      })
      if (liked) {
        return callback({ status: 'bad request', message: 'You already liked this tweet.' })
      }
      await Like.create({ UserId, TweetId })
      return callback({ status: 'success', message: `You liked @${likedTweetAuthor}'s tweet successfully.` })
    } catch (err) {
      console.log(err)
    }
  },
  postUnlike: async (req, res, callback) => {
    // #swagger.tags = ['Likes']
    // #swagger.description = 'Post an unlike.'
    try {
      const TweetId = req.params.id
      const UserId = req.user.id
      const unlikedTweet = await Tweet.findByPk(
        TweetId, { include: [User] }
      )
      if (!unlikedTweet) {
        return callback({ status: 'error', message: 'Cannot find this tweet in db.' })
      }
      const unlikedTweetAuthor = unlikedTweet.dataValues.User.dataValues.account
      const liked = await Like.findOne({
        where: { UserId, TweetId }
      })
      if (!liked) { callback({ status: 'bad request', message: 'You never like this tweet before.' }) }
      await liked.destroy()
      return callback({ status: 'success', message: `You unliked ${unlikedTweetAuthor}'s tweet successfully.` })
    } catch (err) {
      console.log(err)
    }
  }

}
module.exports = tweetService
