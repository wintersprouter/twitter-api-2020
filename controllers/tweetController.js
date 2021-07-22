const tweetService = require('../services/tweetService')

const TweetController = {
  getTweets: (req, res, next) => {
    // #swagger.tags = ['Tweets']
    // #swagger.description = 'Get all tweets data.'
    tweetService.getTweets(req, res, data => {
      if (data.status === 'error') {
        return res.status(404).json(data)
      }
      return res.status(200).json(data)
    }).catch((err) => { next(err) })
  },
  getTweet: async (req, res, next) => {
    // #swagger.tags = ['Tweets']
    // #swagger.description = 'Get a tweet's data.'
    tweetService.getTweet(req, res, data => {
      if (data.status === 'error') {
        return res.status(404).json(data)
      }
      return res.status(200).json(data)
    }).catch((err) => { next(err) })
  },
  postTweet: (req, res, next) => {
    // #swagger.tags = ['Tweets']
    // #swagger.description = 'Post a tweet.'
    tweetService.postTweet(req, res, data => {
      if (data.status === 'error') {
        return res.status(400).json(data)
      }
      if (data.status === 'conflict') {
        return res.status(409).json(data)
      }
      return res.status(200).json(data)
    }).catch((err) => { next(err) })
  },
  getReplies: (req, res, next) => {
    // #swagger.tags = ['Replies']
    // #swagger.description = 'Get replies data.'
    tweetService.getReplies(req, res, data => {
      if (data.status === 'error') {
        return res.status(404).json(data)
      }
      return res.status(200).json(data)
    }).catch((err) => { next(err) })
  },
  postReply: (req, res, next) => {
    // #swagger.tags = ['Replies']
    // #swagger.description = 'Post a reply.'
    tweetService.postReply(req, res, data => {
      if (data.status === 'error') {
        return res.status(404).json(data)
      }
      if (data.status === 'bad request') {
        return res.status(400).json(data)
      }
      if (data.status === 'conflict') {
        return res.status(409).json(data)
      }
      return res.status(200).json(data)
    }).catch((err) => { next(err) })
  },
  postLike: (req, res, next) => {
    // #swagger.tags = ['Likes']
    // #swagger.description = 'Post a like.'
    tweetService.postLike(req, res, data => {
      if (data.status === 'error') {
        return res.status(404).json(data)
      }
      if (data.status === 'bad request') {
        return res.status(400).json(data)
      }
      return res.status(200).json(data)
    }).catch((err) => { next(err) })
  },
  postUnlike: async (req, res, next) => {
    // #swagger.tags = ['Likes']
    // #swagger.description = 'Post an unlike.'
    try {
      const TweetId = req.params.id
      const UserId = req.user.id
      const unlikedTweet = await Tweet.findByPk(
        TweetId, { include: [User] }
      )
      if (!unlikedTweet) {
        return res.status(404).json({ status: 'error', message: 'Cannot find this tweet in db.' })
      }
      const unlikedTweetAuthor = unlikedTweet.dataValues.User.dataValues.account
      const liked = await Like.findOne({
        where: { UserId, TweetId }
      })
      if (!liked) { return res.status(400).json({ status: 'error', message: 'You never like this tweet before.' }) }
      await liked.destroy()
      return res.status(200).json({ status: 'success', message: `You unliked ${unlikedTweetAuthor}'s tweet successfully.` })
    } catch (err) {
      next(err)
    }
  }
}

module.exports = TweetController
