import jwt from 'jsonwebtoken'
import { eq } from 'drizzle-orm'
import type { H3Event } from 'h3'
import { useDatabase } from '../database/client'
import { tenants, users } from '../database/schema'

export type UserRole = 'superadmin' | 'admin'

export interface AuthTokenPayload {
  sub: number
  email: string
  role: UserRole
  tenantId: number | null
}

export interface TenantAuth {
  userId: number
  tenantId: number
}

export function signToken(payload: AuthTokenPayload) {
  const config = useRuntimeConfig()
  return jwt.sign(payload, config.jwtSecret, { expiresIn: '7d' })
}

function verifyToken(event: H3Event): AuthTokenPayload {
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

/**
 * Authenticates a tenant user and returns the tenant every query must be scoped to.
 * The tenant comes from the database (not the token), so suspending a tenant or
 * deleting a user takes effect immediately.
 */
export function requireTenant(event: H3Event): TenantAuth {
  if (event.context.tenantAuth) return event.context.tenantAuth

  const payload = verifyToken(event)
  const db = useDatabase()
  const row = db
    .select({ userId: users.id, tenantId: users.tenantId, role: users.role, status: tenants.status })
    .from(users)
    .leftJoin(tenants, eq(users.tenantId, tenants.id))
    .where(eq(users.id, payload.sub))
    .get()

  if (!row) {
    throw createError({ statusCode: 401, statusMessage: 'User no longer exists' })
  }
  if (row.role === 'superadmin' || !row.tenantId) {
    throw createError({ statusCode: 403, statusMessage: 'Esta área é só para contas de empresa' })
  }
  if (row.status !== 'ativo') {
    throw createError({ statusCode: 403, statusMessage: 'Conta suspensa. Contacte o suporte.' })
  }

  const auth: TenantAuth = { userId: row.userId, tenantId: row.tenantId }
  event.context.tenantAuth = auth
  return auth
}

/** Authenticates the platform owner (superadmin), who manages tenants. */
export function requireSuperadmin(event: H3Event): { userId: number } {
  const payload = verifyToken(event)
  const db = useDatabase()
  const user = db.select({ id: users.id, role: users.role }).from(users).where(eq(users.id, payload.sub)).get()

  if (!user) {
    throw createError({ statusCode: 401, statusMessage: 'User no longer exists' })
  }
  if (user.role !== 'superadmin') {
    throw createError({ statusCode: 403, statusMessage: 'Forbidden' })
  }

  return { userId: user.id }
}
