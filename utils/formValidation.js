const db = require('../models')
const { User } = db
const validator = require('validator')

function checkInputFormat (req, message) {
  const { account, name, email, password, checkPassword } = req.body
  // check all inputs are required
  if (!account || !name || !email || !password || !checkPassword) {
    message.push('All fields are required！')
  }
  // check name length and type
  if (name && !validator.isByteLength(name, { min: 0, max: 50 })) {
    message.push('Name can not be longer than 50 characters.')
  }
  // check account length and type
  if (account && !validator.isByteLength(account, { min: 0, max: 20 })) {
    message.push('Account can not be longer than 20 characters.')
  }
  // check email validation
  if (email && !validator.isEmail(email)) {
    message.push(`${email} is not a valid email address.`)
  }
  // check password length and type
  if (password && !validator.isByteLength(password, { min: 5, max: 15 })) {
    message.push('Password does not meet the required length.')
  }
  // check password and checkPassword
  if (password && (password !== checkPassword)) {
    message.push('The password and confirmation do not match.Please retype them.')
  }
  return message
}
async function checkUserInfo (req, message) {
  try {
    const { account, email } = req.body
    await checkInputFormat(req, message)
    const [inputEmail, inputAccount] = await Promise.all([User.findOne({ where: { email } }), User.findOne({ where: { account } })])
    if (inputEmail) {
      message.push('This email address is already being used.')
    }
    if (inputAccount) {
      message.push('This account is already being used.')
    }
    return message
  } catch (err) {
    console.log(err)
  }
}
async function checkUserInfoEdit (req, message) {
  try {
    const { account, email } = req.body
    const { email: currentEmail, account: currentAccount } = req.user
    await checkInputFormat(req, message)
    if (account !== currentAccount) {
      const userAccount = await User.findOne({ where: { account } })
      if (userAccount) {
        message.push('This account is already being used.')
      }
    }
    if (email !== currentEmail) {
      const userEmail = await User.findOne({ where: { email } })
      if (userEmail) {
        message.push('This email address is already being used.')
      }
    }
    return message
  } catch (err) {
    console.log(err)
  }
}

module.exports = { checkInputFormat, checkUserInfoEdit, checkUserInfo }
