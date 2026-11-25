import { and, eq } from 'drizzle-orm'
import { useDatabase } from '../../database/client'
import { users } from '../../database/schema'

export default defineEventHandler((event) => {
  const { userId, tenantId } = requireTenant(event)

  const id = Number(getRouterParam(event, 'id'))
  if (!Number.isFinite(id)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid user id' })
  }
  if (id === userId) {
    throw createError({ statusCode: 400, statusMessage: 'Não pode apagar a sua própria conta' })
  }

  const db = useDatabase()
  const [deleted] = db
    .delete(users)
    .where(and(eq(users.id, id), eq(users.tenantId, tenantId)))
    .returning({ id: users.id })
    .all()

  if (!deleted) {
    throw createError({ statusCode: 404, statusMessage: 'User not found' })
  }

  return { success: true }
})
