export const checkOrigin = origin => {
  if (!process.env.ALLOWED_ORIGINS) return false
  if (process.env.ALLOWED_ORIGINS === '*') return '*'
  const allowedOrigins = process.env.ALLOWED_ORIGINS.split(' ')
  return allowedOrigins.includes(origin) && origin
}
