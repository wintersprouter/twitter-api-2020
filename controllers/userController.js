const userService = require('../services/userService')

const userController = {
  signIn: (req, res, next) => {
    // #swagger.tags = ['SignUp/Signin']
    // #swagger.description = 'User and admin sign in.'
    userService.signIn(req, res, data => {
      if (data.status === 'error: bad request') {
        return res.status(400).json(data)
      }
      if (data.status === 'error: unauthorized') {
        return res.status(401).json(data)
      }
      return res.status(200).json(data)
    }).catch((err) => { next(err) })
  },
  signUp: (req, res, next) => {
    // #swagger.tags = ['SignUp/Signin']
    // #swagger.description = 'User sign up.'
    userService.signUp(req, res, data => {
      if (data.status === 'error: bad request') {
        return res.status(400).json(data)
      }
      return res.status(200).json(data)
    }).catch((err) => { next(err) })
  },

  getCurrentUser: (req, res, next) => {
    // #swagger.tags = ['Users']
    // #swagger.description = 'Get current user's data.'
    userService.getCurrentUser(req, res, data => {
      return res.status(200).json(data)
    }).catch((err) => { next(err) })
  },
  getTopUsers: (req, res, next) => {
    // #swagger.tags = ['Users']
    // #swagger.description = 'Get top ten users data.'
    userService.getTopUsers(req, res, data => {
      if (data.status === 'error') {
        return res.status(404).json(data)
      }
      return res.status(200).json(data)
    }).catch((err) => { next(err) })
  },
  editAccount: (req, res, next) => {
    // #swagger.tags = ['Users']
    // #swagger.description = 'Edit user's account information.'
    userService.editAccount(req, res, data => {
      if (data.status === 'error: bad request') {
        return res.status(400).json(data)
      }
      if (data.status === 'error: not found') {
        return res.status(404).json(data)
      }
      if (data.status === 'error: unauthorized') {
        return res.status(401).json(data)
      }
      return res.status(200).json(data)
    }).catch((err) => { next(err) })
  },
  getUser: (req, res, next) => {
    // #swagger.tags = ['Users']
    // #swagger.description = 'Get a user's data.'
    userService.getUser(req, res, data => {
      if (data.status === 'error') {
        return res.status(404).json(data)
      }
      return res.status(200).json(data)
    }).catch((err) => { next(err) })
  },
  editUserProfile: (req, res, next) => {
    // #swagger.tags = ['Users']
    // #swagger.description = 'Edit user's profile.'
    userService.editUserProfile(req, res, data => {
      if (data.status === 'error: bad request') {
        return res.status(400).json(data)
      }
      if (data.status === 'error: not found') {
        return res.status(404).json(data)
      }
      if (data.status === 'error: unauthorized') {
        return res.status(401).json(data)
      }
      return res.status(200).json(data)
    }).catch((err) => { next(err) })
  },

  getUserTweets: (req, res, next) => {
    // #swagger.tags = ['Users']
    // #swagger.description = 'Get user's tweets data.'
    userService.getUserTweets(req, res, data => {
      if (data.status === 'error: not found') {
        return res.status(404).json(data)
      }
      return res.status(200).json(data)
    }).catch((err) => { next(err) })
  },

  getUserReplies: (req, res, next) => {
    // #swagger.tags = ['Users']
    // #swagger.description = 'Get user's replies data.'
    userService.getUserReplies(req, res, data => {
      if (data.status === 'error: not found') {
        return res.status(404).json(data)
      }
      return res.status(200).json(data)
    }).catch((err) => { next(err) })
  },

  getUserLikes: (req, res, next) => {
    // #swagger.tags = ['Users']
    // #swagger.description = 'Get user's liked tweets data.'
    userService.getUserLikes(req, res, data => {
      if (data.status === 'error: not found') {
        return res.status(404).json(data)
      }
      return res.status(200).json(data)
    }).catch((err) => { next(err) })
  },

  getUserFollowings: async (req, res, next) => {
    // #swagger.tags = ['Users']
    // #swagger.description = 'Get user's followings data.'
    try {
      let user = await User.findByPk(req.params.id,
        {
          include: [
            { model: User, as: 'Followings' }],
          order: [['Followings', Followship, 'createdAt', 'DESC']]
        })
      if (!user || user.role === 'admin') {
        return res.status(404).json({ status: 'error', message: 'Cannot find this user in db.' })
      }
      if (!user.Followings.length) {
        return res.status(200).json({ message: `@${user.account} has no following.` })
      }

      user = user.Followings.map(following => ({
        followingId: following.id,
        account: following.account,
        name: following.name,
        avatar: following.avatar,
        introduction: following.introduction,
        followshipCreatedAt: following.Followship.createdAt,
        isFollowed: helpers.getUser(req).Followings.map(f => f.id).includes(following.id)
      }))
      return res.status(200).json(user)
    } catch (err) {
      next(err)
    }
  },
  getUserFollowers: async (req, res, next) => {
    // #swagger.tags = ['Users']
    // #swagger.description = 'Get user's followers data.'
    try {
      let user = await User.findByPk(req.params.id,
        {
          include: [
            { model: User, as: 'Followers' }
          ],
          order: [['Followers', Followship, 'createdAt', 'DESC']]
        })
      if (!user || user.role === 'admin') {
        return res.status(404).json({ status: 'error', message: 'Cannot find this user in db.' })
      }
      if (!user.Followers.length) {
        return res.status(200).json({ message: `@${user.account} has no follower.` })
      }
      user = user.Followers.map(follower => ({
        followerId: follower.id,
        account: follower.account,
        name: follower.name,
        avatar: follower.avatar,
        introduction: follower.introduction,
        followshipCreatedAt: follower.Followship.createdAt,
        isFollowed: helpers.getUser(req).Followings.map(f => f.id).includes(follower.id)
      }))
      return res.status(200).json(user)
    } catch (err) {
      next(err)
    }
  }
}

module.exports = userController
