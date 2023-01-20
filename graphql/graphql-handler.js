import { applyMiddleware } from 'graphql-middleware'
import { makeExecutableSchema } from '@graphql-tools/schema'
import { parse, validate, execute, GraphQLError } from 'graphql'
import { resolvers } from './resolvers/index.js'
import { permissions } from './permissions.js'
import { readFileSync } from 'node:fs'
import { lru } from 'tiny-lru'
import { handleErrors } from './error-handler.js'

const typeDefs = [
  readFileSync(new URL('schema.graphql', import.meta.url), 'utf8').toString(),
]
const cache = lru(1000, 60 * 60 * 1000)

const schema = makeExecutableSchema({ typeDefs, resolvers })

const schemaWithPermissions = applyMiddleware(
  schema,
  permissions.generate(schema),
  handleErrors,
)

export async function graphqlHandler(query, variables, user) {
  if (!query) return new GraphQLError('No query was provided')
  const cacheKey = query || ''
  const cached = cache.get(cacheKey)
  let document = cached?.document
  let validationErrors = cached?.validationErrors

  if (!document) {
    document = parse(query)
    cache.set(cacheKey, { document })
  }

  if (!validationErrors) {
    validationErrors = validate(schemaWithPermissions, document)
    cache.set(cacheKey, { document, validationErrors })
  }

  if (validationErrors.length > 0) {
    return { errors: [...validationErrors] }
  }

  const result = await execute({
    schema: schemaWithPermissions,
    document,
    contextValue: { user },
    variableValues: variables,
  })
  return result
}
