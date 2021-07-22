const db = require('../models')
const { Message, User } = db

const chatService = {
  getHistoryMessage: async (req, res, callback) => {
    try {
      let historyMessage = await Message.findAll({
        include: [User],
        order: [['createdAt', 'ASC']]
      })
      if (!historyMessage) {
        return callback({ status: 'error', message: 'Cannot find any historyMessage in db.' })
      }
      historyMessage = historyMessage.map(message => {
        return {
          id: message.id,
          UserId: message.UserId,
          content: message.content,
          createdAt: message.createdAt,
          account: message.User.account,
          name: message.User.name,
          avatar: message.User.avatar
        }
      })
      historyMessage.status = 'success'
      return callback(historyMessage)
    } catch (err) {
      console.log(err)
    }
  }
}
module.exports = chatService
