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

  getUserReplies: async (req, res, next) => {
    // #swagger.tags = ['Users']
    // #swagger.description = 'Get user's replies data.'
    try {
      const UserId = req.params.id
      const user = await User.findByPk(UserId)
      if (!user || user.role === 'admin') {
        return res.status(404).json({ status: 'error', message: 'Cannot find this user in db.' })
      }

      let replies = await Reply.findAll({
        where: { UserId },
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

  getUserLikes: async (req, res, next) => {
    // #swagger.tags = ['Users']
    // #swagger.description = 'Get user's liked tweets data.'
    try {
      const UserId = req.params.id
      const user = await User.findByPk(UserId)
      if (!user || user.role === 'admin') {
        return res.status(404).json({ status: 'error', message: 'Cannot find this user in db.' })
      }
      let likes = await Like.findAll({
        where: { UserId },
        include: [{
          model: Tweet,
          include: [{ model: User },
            { model: Reply, include: [{ model: User }] }, Like]
        }],
        order: [['createdAt', 'DESC']]
      })
      if (!likes) {
        return res.status(404).json({ status: 'error', message: 'Cannot find any liked tweets in db.' })
      }
      likes = likes.map(like => {
        return {
          id: like.id,
          UserId: like.UserId,
          TweetId: like.TweetId,
          likeCreatedAt: like.createdAt,
          account: like.Tweet.User.account,
          name: like.Tweet.User.name,
          avatar: like.Tweet.User.avatar,
          description: like.Tweet.description,
          tweetCreatedAt: like.Tweet.createdAt,
          likedCount: like.Tweet.Likes.length,
          repliedCount: like.Tweet.Replies.length,
          isLike: like.Tweet.Likes.some((t) => t.UserId === req.user.id)
        }
      })
      return res.status(200).json(likes)
    } catch (err) {
      next(err)
    }
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
