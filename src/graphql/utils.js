const { createVerifier } = require('fast-jwt')
const { get } = require('@begin/data')

const verify = createVerifier({ key: process.env.JWT_SECRET })

const getUser = async headers => {
  const { authorization } = headers
  if (authorization) {
    const token = authorization.replace('Bearer ', '')
    const verifiedToken = verify(token)
    const key = verifiedToken && verifiedToken.userId
    if (!key) return
    const user = await get({ table: 'users', key })
    if (!user) return
    delete user.password
    return user
  }
}

const isValidEmail = email => {
  // A technically accurate regex for email validation would be incredibly long.
  // Instead we just want to check if the string is probably an email address to
  // catch a few common typing errors. Real validation uses verification emails.
  const mailFormatRegex = /^\S+@\S+\.\S+$/
  return email.match(mailFormatRegex)
}

module.exports = {
  getUser,
  isValidEmail,
}
