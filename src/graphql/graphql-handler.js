const { applyMiddleware } = require('graphql-middleware')
const { makeExecutableSchema } = require('@graphql-tools/schema')
const { parse, validate, execute, GraphQLError } = require('graphql')
const { resolvers } = require('./resolvers/index.js')
const { permissions } = require('./permissions.js')
const { readFileSync } = require('node:fs')
const { lru } = require('tiny-lru')
const { handleErrors } = require('./error-handler.js')

const typeDefs = readFileSync('./schema.graphql', 'utf8').toString()
const cache = lru(1000, 60 * 60 * 1000)

const schema = makeExecutableSchema({ typeDefs, resolvers })

const schemaWithPermissions = applyMiddleware(
  schema,
  permissions.generate(schema),
  handleErrors,
)

module.exports.graphqlHandler = async function (query, variables, user) {
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
