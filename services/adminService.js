const db = require('../models')
const { User, Tweet, Like } = db

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

      users = users.map(user => {
        let likedCount = 0
        user.Tweets.forEach(tweet => {
          likedCount += tweet.Likes.length
        })
        return {
          id: user.id,
          account: user.account,
          name: user.name,
          avatar: user.avatar,
          cover: user.cover,
          tweetCount: user.Tweets.length,
          likedCount,
          followingCount: user.Followings.length,
          followerCount: user.Followers.length
        }
      })
      users.sort((a, b) => b.tweetCount - a.tweetCount)
      let data
      data = users
      data.status = 'success'
      return callback(data)
    } catch (err) {
      console.log(err)
    }
  }
}
module.exports = adminService
