import {
  DateResolver,
  DateTimeResolver,
  EmailAddressResolver,
} from 'graphql-scalars'
import { Query } from './query.js'
import { Mutation } from './mutation/index.js'

export const resolvers = {
  Date: DateResolver,
  DateTime: DateTimeResolver,
  EmailAddress: EmailAddressResolver,
  Mutation,
  Query,
}
