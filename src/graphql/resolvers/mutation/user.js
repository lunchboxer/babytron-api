import { get, set, destroy, count } from '@begin/data'
import { scryptSync, randomBytes } from 'node:crypto'
import { createSigner } from 'fast-jwt'

import { GraphQLError } from 'graphql'

const sign = createSigner({ key: process.env.JWT_SECRET })

async function forceUniqueEmail(email) {
  const allUsers = await get({ table: 'users' })
  const sameEmailUser = allUsers.find(aUser => aUser.email === email)
  if (sameEmailUser) {
    throw new GraphQLError('A user with that email already exists.')
  }
}

async function forceUniqueUsername(username) {
  const allUsers = await get({ table: 'users' })
  const sameUsernameUser = allUsers.find(aUser => aUser.username === username)
  if (sameUsernameUser) {
    throw new GraphQLError('A user with that username already exists.')
  }
}

function encryptPassword(password, salt) {
  return scryptSync(password, salt, 32).toString('hex')
}
function hashPassword(password) {
  const salt = randomBytes(16).toString('hex')
  return encryptPassword(password, salt) + salt
}

function passwordMatches(password, hash) {
  const salt = hash.slice(64)
  const originalPassHash = hash.slice(0, 64)
  const currentPassHash = encryptPassword(password, salt)
  return originalPassHash === currentPassHash
}

export const user = {
  createUser: async (_, { input }, context) => {
    const { password, ...parameters } = input
    if (parameters.email) await forceUniqueEmail(parameters.email)
    await forceUniqueUsername(parameters.username)
    const hashedPassword = hashPassword(password)
    const isAdmin = !(await count({ table: 'users' }))
    const user = await set({
      table: 'users',
      password: hashedPassword,
      isAdmin,
      ...parameters,
    })
    return {
      token: sign({ userId: user.key }, process.env.JWT_SECRET),
      user,
    }
  },
  login: async (_, { username, password }) => {
    const users = await get({ table: 'users' })
    const user = users.find(u => u.username === username)
    if (!user) throw new GraphQLError(`Username '${username}' not found.`)
    if (!passwordMatches(password, user.password)) {
      throw new GraphQLError('Username or password invalid')
    }
    return {
      token: sign({ userId: user.key }),
      user,
    }
  },
  deleteUser: async (_, { key }, context) => {
    const user = await get({ table: 'users', key })
    if (!user) throw new GraphQLError('User not found.')
    await destroy({ table: 'users', key })
    return user
  },
  updateUser: async (_, { input }) => {
    const { key, ...data } = input
    const user = await get({ table: 'users', key })
    if (!user) throw new GraphQLError('User not found.')
    const updatedUser = { ...user, ...data }
    if (data.email && data.email !== user.email) {
      await forceUniqueEmail(data.email)
    }
    if (data.username && data.username !== user.username) {
      await forceUniqueUsername(data.username)
    }
    await set({ ...updatedUser })
    return updatedUser
  },
}
