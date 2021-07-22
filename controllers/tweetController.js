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
  getReplies: async (req, res, next) => {
    // #swagger.tags = ['Replies']
    // #swagger.description = 'Get replies data.'
    try {
      let replies = await Reply.findAll({
        where: { TweetId: req.params.tweet_id },
        include: [User, { model: Tweet, include: User }],
        order: [['createdAt', 'DESC']]
      })
      if (!replies) {
        return res.status(404).json({ status: 'error', message: 'Cannot find any replies in db.' })
      }
      replies = replies.map(reply => {
        return {
          id: reply.id,
          UserId: reply.UserId,
          TweetId: reply.TweetId,
          tweetAuthorAccount: reply.Tweet.User.account,
          comment: reply.comment,
          createdAt: reply.createdAt,
          commentAccount: reply.User.account,
          name: reply.User.name,
          avatar: reply.User.avatar
        }
      })
      return res.status(200).json(replies)
    } catch (err) {
      next(err)
    }
  },
  postReply: async (req, res, next) => {
    // #swagger.tags = ['Replies']
    // #swagger.description = 'Post a reply.'
    try {
      const TweetId = req.params.tweet_id
      const repliedTweet = await Tweet.findByPk(TweetId, { include: [User] })
      if (!repliedTweet) {
        return res.status(404).json({ status: 'error', message: 'Cannot find this tweet in db.' })
      }
      const repliedTweetAuthor = repliedTweet.dataValues.User.dataValues.account
      const { comment } = req.body
      if (!comment) {
        return res.status(400).json({ status: 'error', message: 'Please input comment.' })
      }
      if (comment && !validator.isByteLength(comment, { min: 0, max: 50 })) {
        return res.status(409).json({ status: 'error', message: 'Comment can\'t be more than 50 words.' })
      }
      await Reply.create({
        UserId: req.user.id,
        TweetId,
        comment
      })
      return res.status(200).json({ status: 'success', message: `You replied @${repliedTweetAuthor}'s tweet successfully.` })
    } catch (err) {
      next(err)
    }
  },
  postLike: async (req, res, next) => {
    // #swagger.tags = ['Likes']
    // #swagger.description = 'Post a like.'
    try {
      const TweetId = req.params.id
      const UserId = req.user.id
      const likedTweet = await Tweet.findByPk(
        TweetId, { include: [User] }
      )
      if (!likedTweet) {
        return res.status(404).json({ status: 'error', message: 'Cannot find this tweet in db.' })
      }
      const likedTweetAuthor = likedTweet.dataValues.User.dataValues.account
      const liked = await Like.findOne({
        where: { UserId, TweetId }
      })
      if (liked) {
        return res.status(400).json({ status: 'error', message: 'You already liked this tweet.' })
      }
      await Like.create({ UserId, TweetId })
      return res.status(200).json({ status: 'success', message: `You liked @${likedTweetAuthor}'s tweet successfully.` })
    } catch (err) {
      next(err)
    }
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
