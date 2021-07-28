const jwt = require('jsonwebtoken')
const db = require('../models')
const { Message, User } = db
module.exports = {
  randomDate: (start, end) => {
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()))
  },
  socketAuthenticated: async (socket, next) => {
    const token = socket.handshake.query.token
    if (!token) return
    if (socket.handshake.query && token) {
      jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
        try {
          if (err) return next(new Error('Authentication error'))
          socket.decoded = decoded
          socket.userId = decoded.id
          next()
        } catch (err) {
          console.log(err)
        }
      })
    } else {
      next(new Error('Authentication error'))
    }
  },
  getUserInfo: async (socket) => {
    try {
      const user = await User.findByPk(socket.userId, {
        attributes: ['id', 'name', 'account', 'avatar', 'role']
      })
      if (user) {
        socket.user = user.dataValues
        socket.user.socketId = socket.id
        return user
      }
    } catch (err) {
      console.log(err)
    }
  },
  generateActiveUsers: async (onlineUser, activeUsers) => {
    try {
      if (activeUsers.map(u => u.id).includes(onlineUser.id)) {
        console.log('This user already existed.')
      } else {
        activeUsers.push(onlineUser)
        return activeUsers
      }
    } catch (err) {
      console.log(err)
    }
  },
  saveMessage: async (data, socket) => {
    try {
      let message = await Message.create({
        content: data,
        UserId: socket.userId,
        createdAt: Date.now()
      })
      message = message.dataValues
      return message
    } catch (err) {
      console.log(err)
    }
  },
  removeDisconnectUser: (activeUsers, offlineUser) => {
    const activeUsersIndex = activeUsers.map(u => u.id).indexOf(offlineUser.id)
    activeUsers.splice(activeUsersIndex, 1)
    return activeUsers
  }
}
