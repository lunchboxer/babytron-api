const { shield, rule, or } = require('graphql-shield')
const { count } = require('@begin/data')

const isAuthenticated = rule()(async (_, parameters, context) => {
  return !!context.user || new Error('Only authenticated users may access')
})
const isAdmin = rule()(async (root, parameters, { user }) => {
  return user?.isAdmin || new Error('Must be admin to access')
})
const isThisUser = rule()(async (root, parameters, context) => {
  return (
    context.user?.id === parameters.id ||
    new Error('Only the same user may access this data.')
  )
})

const noUsersExist = rule()(async (_, parameters, context) => {
  const userCount = await count({ table: 'users' })
  return !userCount || new Error('First admin user already created')
})

module.exports.permissions = shield(
  {
    Query: {
      me: isAuthenticated,
      users: isAdmin,
      user: isAdmin,
    },
    Mutation: {
      createUser: or(noUsersExist, isAdmin),
      // deleteUser: isAdmin,
      updateUser: or(isThisUser, isAdmin),
      // changePassword: or(isThisUser, isAdmin),
    },
  },
  {
    allowExternalErrors: true,
  },
)
