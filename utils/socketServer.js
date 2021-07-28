const db = require('../models')
const { Message } = db
const activeUsers = []
const { socketAuthenticated, getUserInfo, generateActiveUsers } = require('./functions')

module.exports = (io) => {
  io.use(socketAuthenticated).on('connection', async socket => {
    try {
      const userId = socket.userId
      if (!userId) { return }
      console.log('connection', userId)

      await getUserInfo(socket)
      const onlineUser = socket.user
      await generateActiveUsers(onlineUser, activeUsers)

      const activeData = { activeUsersCount: activeUsers.length, activeUsers }
      const data = { online: true, onlineUser }

      io.emit('activeUsers', activeData)
      io.emit('notification', data)

      console.log('activeUsers', activeData)
      console.log('notification', data)

      socket.on('disconnect', async () => {
        if (!socket.user) { return }

        console.log('disconnect', socket.user)

        const offlineUser = socket.user
        const activeUsersIndex = activeUsers.map(u => u.id).indexOf(offlineUser.id)
        activeUsers.splice(activeUsersIndex, 1)

        const data = { online: false, onlineUser }
        const activeData = { activeUsersCount: activeUsers.length, activeUsers }

        io.emit('notification', data)
        io.emit('activeUsers', activeData)

        console.log('activeUsers', activeData)
        console.log('notification', data)
      })
      socket.on('sendMessage', async (data) => {
        console.log('sendMessage socket.user', socket.user)
        try {
          if (data) {
            const message = await Message.create({
              content: data,
              UserId: socket.userId,
              createdAt: Date.now()
            })
            // 傳送使用者和訊息
            console.log('message: ', message.toJSON())
            console.log('message content: ', data)
            const createdMessage = message.toJSON()
            const newInfo = {
              id: createdMessage.id,
              UserId: socket.userId,
              content: data,
              createdAt: createdMessage.createdAt,
              account: socket.user.account,
              name: socket.user.name,
              avatar: socket.user.avatar
            }
            console.log('newInfo', newInfo)
            io.emit('newMessage', newInfo)
          }
        } catch (err) { console.log(err) }
      })
    } catch (err) {
      console.log(err)
    }
  })
}
