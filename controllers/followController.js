const followService = require('../services/followService')

const followController = {
  addFollowing: (req, res, next) => {
    // #swagger.tags = ['Followships']
    // #swagger.description = 'Follow a user.'
    followService.addFollowing(req, res, data => {
      if (data.status === 'error') {
        return res.status(404).json(data)
      }
      if (data.status === 'forbidden') {
        return res.status(409).json(data)
      }
      if (data.status === 'forbidden') {
        return res.status(403).json(data)
      }
      return res.status(200).json(data)
    }).catch((err) => { next(err) })
  },
  removeFollowing: async (req, res, next) => {
    // #swagger.tags = ['Followships']
    // #swagger.description = 'Unfollow a user.'
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
        return res.status(404).json({ status: 'error', message: 'Cannot find this followingId or followerId.' })
      }

      if (followerId === Number(followingId)) {
        return res.status(403).json({ status: 'error', message: 'You cannot unfollow yourself.' })
      }

      const followship = await Followship.findOne({
        where: {
          followerId,
          followingId
        }
      })

      if (!followship) {
        return res.status(409).json({ status: 'error', message: `You didn't followed @${unfollowingUser.account} before.` })
      }

      await followship.destroy()

      return res.status(200).json({ status: 'success', message: `Unfollowed @${unfollowingUser.account} successfully.` })
    } catch (err) {
      next(err)
    }
  }
}

module.exports = followController
