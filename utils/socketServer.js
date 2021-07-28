const activeUsers = []
const { socketAuthenticated, getUserInfo, generateActiveUsers, saveMessage } = require('./functions')

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
        try {
          if (!data) { return }

          const newMessage = await saveMessage(data, socket)

          await getUserInfo(socket)
          const author = socket.user

          const newMessageInfo = {
            message: newMessage,
            author: author
          }
          console.log(newMessageInfo)

          io.emit('newMessage', newMessageInfo)
        } catch (err) { console.log(err) }
      })
    } catch (err) {
      console.log(err)
    }
  })
}
