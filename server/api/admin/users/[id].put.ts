import { and, eq, isNotNull } from 'drizzle-orm'
import { useDatabase } from '../../../database/client'
import { users } from '../../../database/schema'

// Lets the platform admin rename a tenant user or reset their password.
export default defineEventHandler(async (event) => {
  requireSuperadmin(event)

  const id = Number(getRouterParam(event, 'id'))
  if (!Number.isFinite(id)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid user id' })
  }

  const body = await readBody(event)
  const updates: Partial<typeof users.$inferInsert> = {}

  if (body?.name !== undefined) {
    updates.name = typeof body.name === 'string' ? body.name.trim() || null : null
  }
  if (body?.password !== undefined) {
    updates.passwordHash = await hashTenantUserPassword(body.password)
  }

  if (!Object.keys(updates).length) {
    throw createError({ statusCode: 400, statusMessage: 'Nada para atualizar' })
  }

  const db = useDatabase()
  const [updated] = db
    .update(users)
    .set(updates)
    .where(and(eq(users.id, id), isNotNull(users.tenantId)))
    .returning({ id: users.id, name: users.name, email: users.email, createdAt: users.createdAt })
    .all()

  if (!updated) {
    throw createError({ statusCode: 404, statusMessage: 'Utilizador não encontrado' })
  }

  return updated
})
