const { checkOrigin } = require('@architect/shared/check-origin.js')

// This is a funny way to support CORS pre-flight requests
module.exports.handler = async request => {
  // compare to allowed origins, if it exists, then return origin, if not - return false
  const origin = checkOrigin(request.headers.origin)
  if (origin === false) {
    return { statusCode: 403 }
  }
  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': origin,
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'authorization,content-type',
      'Access-Control-Max-Age': 86400,
    },
  }
}
