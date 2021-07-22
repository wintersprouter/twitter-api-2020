const db = require('../models')
const { Tweet, User, Like, Reply } = db
const validator = require('validator')
const tweetService = {
  getTweets: async (req, res, callback) => {
    try {
      let tweets = await Tweet.findAll({
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
      tweets = tweets.map(tweet => {
        return {
          id: tweet.id,
          UserId: tweet.UserId,
          description: tweet.description,
          createdAt: tweet.createdAt,
          account: tweet.User.account,
          name: tweet.User.name,
          avatar: tweet.User.avatar,
          likedCount: tweet.Likes.length,
          repliedCount: tweet.Replies.length,
          isLike: tweet.LikedUsers.map(t => t.id).includes(req.user.id)
        }
      })
      tweets.status = 'success'
      return callback(tweets)
    } catch (err) {
      console.log(err)
    }
  }

}
module.exports = tweetService
