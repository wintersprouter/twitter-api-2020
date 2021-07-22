const db = require('../models')
const { Followship, User } = db

const followService = {
  addFollowing: async (req, res, callback) => {
    try {
      const followerId = req.user.id
      const followingId = req.body.id
      // check this followingId's role should be user.
      const followingUser = await User.findOne({
        where: {
          id: followingId,
          role: 'user'
        }
      })
      // check this followerId's role should be user.
      const followerUser = await User.findOne({
        where: {
          id: followerId,
          role: 'user'
        }
      })
      // check both followerId and followingId are existed.
      if (!followingUser || !followerUser) {
        return callback({ status: 'error', message: 'Cannot find this followingId or followerId.' })
      }
      // cannot follow self.
      if (followerId === Number(followingId)) {
        return callback({ status: 'forbidden', message: 'You cannot follow yourself.' })
      }
      // check followship
      const followship = await Followship.findOne({
        where: {
          followerId,
          followingId
        }
      })
      if (followship) {
        return callback({ status: 'conflict', message: `You already followed @${followingUser.account}` })
      }
      await Followship.create({
        followerId,
        followingId
      })
      return callback({ status: 'success', message: `You followed @${followingUser.account} successfully.` })
    } catch (err) {
      console.log(err)
    }
  },
  removeFollowing: async (req, res, callback) => {
    try {
      const followerId = req.user.id
      const followingId = req.params.followingId

      const unfollowingUser = await User.findOne({
        where: {
          id: followingId,
          role: 'user'
        }
      })
      // check this followerId's role should be user.
      const unfollowerUser = await User.findOne({
        where: {
          id: followerId,
          role: 'user'
        }
      })
      if (!unfollowingUser || !unfollowerUser) {
        return callback({ status: 'error', message: 'Cannot find this followingId or followerId.' })
      }
      if (followerId === Number(followingId)) {
        return callback({ status: 'forbidden', message: 'You cannot unfollow yourself.' })
      }
      const followship = await Followship.findOne({
        where: {
          followerId,
          followingId
        }
      })
      if (!followship) {
        return callback({ status: 'conflict', message: `You didn't followed @${unfollowingUser.account} before.` })
      }
      await followship.destroy()
      return callback({ status: 'success', message: `Unfollowed @${unfollowingUser.account} successfully.` })
    } catch (err) {
      console.log(err)
    }
  }

}
module.exports = followService
