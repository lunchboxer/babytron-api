import { count, get } from '@begin/data'
import { GraphQLError } from 'graphql'

export const Query = {
  userCount: async () => {
    return await count({ table: 'users' })
  },
  me: async (_, parameters, context) => {
    return context.user
  },
  user: async (_, { key }) => {
    const foundUser = await get({ table: 'users', key })
    if (!foundUser) throw new GraphQLError('User not found.')
    return foundUser
  },
  users: async () => {
    return await get({ table: 'users' })
  },
}
