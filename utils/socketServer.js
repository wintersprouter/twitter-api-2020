const db = require('../models')
const { Message, User } = db
const activeUsers = []
let activeUsersCount = 0
const { socketAuthenticated,getUserInfo } = require('./functions')

module.exports = (io) => {
  io.use(socketAuthenticated).on('connection', async socket => {
    try {
      console.log('connection', socket.userId)
      await getUserInfo(socket)
      const onlineUser = socket.user
      console.log('onlineUser', onlineUser)
      
      // if (activeUsers.map(u => u.id).includes(user.id)) {
      //   console.log('This user already existed.')
      //   activeUsersCount = activeUsers.length
      //   return activeUsersCount
      // } else {
      //   activeUsers.push(onlineUser)
      //   activeUsersCount++
      // }
      console.log('activeUsers', activeUsers)
      const activeData = { activeUsersCount, activeUsers }
      console.log('activeData', activeData)
      io.emit('activeUsers', activeData)
      const data = { online: true, onlineUser }
      io.emit('notification', data)

      socket.on('disconnect', async () => {
        if (!socket.user) { return }
        console.log('disconnect', socket.user)
        const offlineUser = socket.user
        const activeUsersIndex = activeUsers.map(u => u.id).indexOf(offlineUser.id)
        activeUsers.splice(activeUsersIndex, 1)
        console.log('activeUsers', activeUsers)
        activeUsersCount = activeUsers.length
        console.log(activeUsersCount)
        const data = { online: false, onlineUser }
        io.emit('notification', data)
        const activeData = { activeUsersCount, activeUsers }
        io.emit('activeUsers', activeData)
      })
      socket.on('sendMessage', async (data) => {
        console.log('sendMessage socket.user', socket.user)
        try {
          if (data) {
            let message = await Message.create({
              content: data,
              UserId: socket.userId,
              createdAt: Date.now()
            })
            // 傳送使用者和訊息
            console.log('message: ', message.toJSON())
            console.log('message content: ', data)
            let createdMessage = message.toJSON()
            let newInfo = {
              id: createdMessage.id,
              UserId: socket.userId,
              content: data,
              createdAt: createdMessage.createdAt,
              account: socket.user.account,
              name: socket.user.name,
              avatar: socket.user.avatar,
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
