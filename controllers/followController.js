const followService = require('../services/followService')

const followController = {
  addFollowing: (req, res, next) => {
    // #swagger.tags = ['Followships']
    // #swagger.description = 'Follow a user.'
    followService.addFollowing(req, res, data => {
      if (data.status === 'error') {
        return res.status(404).json(data)
      }
      if (data.status === 'conflict') {
        return res.status(409).json(data)
      }
      if (data.status === 'forbidden') {
        return res.status(403).json(data)
      }
      return res.status(200).json(data)
    }).catch((err) => { next(err) })
  },
  removeFollowing: (req, res, next) => {
    // #swagger.tags = ['Followships']
    // #swagger.description = 'Unfollow a user.'
    followService.removeFollowing(req, res, data => {
      if (data.status === 'error') {
        return res.status(404).json(data)
      }
      if (data.status === 'conflict') {
        return res.status(409).json(data)
      }
      if (data.status === 'forbidden') {
        return res.status(403).json(data)
      }
      return res.status(200).json(data)
    }).catch((err) => { next(err) })
  }
}

module.exports = followController
