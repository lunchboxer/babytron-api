import arc from '@architect/functions'
import { checkOrigin } from '@architect/shared'
import { graphqlHandler } from './graphql-handler.js'
import { getUser } from './utils.js'

// This is for CORS
// In this case the request body is a simple json string
const preHandler = async ({ body, headers }) => {
  const { query, variables } = body
  try {
    // const context = { userId: getUserId(headers) }
    const origin = checkOrigin(headers.origin)
    if (origin === false) {
      return { statusCode: 403 }
    }
    const user = await getUser(headers)
    const result = await graphqlHandler(query, variables, user)
    return {
      headers: {
        'Access-Control-Allow-Origin': origin,
      },
      type: 'application/json; charset=utf8',
      body: JSON.stringify(result),
    }
  } catch (error) {
    if (process.env.NODE_ENV === 'production') {
      return JSON.stringify({ error: error.name, message: error.message })
    }
    return JSON.stringify({
      error: error.name,
      message: error.message,
      stack: error.stack,
    })
  }
}

export const handler = arc.http.async(preHandler)
