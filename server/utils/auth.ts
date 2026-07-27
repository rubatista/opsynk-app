import jwt from 'jsonwebtoken'
import type { H3Event } from 'h3'

export interface AuthTokenPayload {
  sub: number
  email: string
}

export function signToken(payload: AuthTokenPayload) {
  const config = useRuntimeConfig()
  return jwt.sign(payload, config.jwtSecret, { expiresIn: '7d' })
}

export function requireUser(event: H3Event): AuthTokenPayload {
  const header = getHeader(event, 'authorization')
  const token = header?.startsWith('Bearer ') ? header.slice(7) : null

  if (!token) {
    throw createError({ statusCode: 401, statusMessage: 'Missing authorization token' })
  }

  try {
    const config = useRuntimeConfig()
    return jwt.verify(token, config.jwtSecret) as unknown as AuthTokenPayload
  } catch {
    throw createError({ statusCode: 401, statusMessage: 'Invalid or expired token' })
  }
}
