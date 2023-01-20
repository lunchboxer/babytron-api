const {
  DateResolver,
  DateTimeResolver,
  EmailAddressResolver,
} = require('graphql-scalars')
const { Query } = require('./query.js')
const { Mutation } = require('./mutation/index.js')

module.exports.resolvers = {
  Date: DateResolver,
  DateTime: DateTimeResolver,
  EmailAddress: EmailAddressResolver,
  Mutation,
  Query,
}
