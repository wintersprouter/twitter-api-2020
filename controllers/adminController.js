const adminService = require('../services/adminService')

const adminController = {
  getUsers: (req, res, next) => {
    // #swagger.tags = ['Admin']
    // #swagger.description = 'Get users data.'
    adminService.getUsers(req, res, data => {
      if (data.status === 'error') {
        return res.status(404).json(data)
      }
      return res.status(200).json(data)
    }).catch((err) => { next(err) })
  },
  deleteTweet: (req, res, next) => {
    // #swagger.tags = ['Admin']
    // #swagger.description = 'Delete a tweet.'
    adminService.deleteTweet
    (req, res, data => {
      if (data.status === 'error') {
        return res.status(401).json(data)
      }
      return res.status(200).json(data)
    }).catch((err) => { next(err) })
  }
}

module.exports = adminController
