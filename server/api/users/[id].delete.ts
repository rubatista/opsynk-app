import { eq } from 'drizzle-orm'
import { useDatabase } from '../../database/client'
import { users } from '../../database/schema'

export default defineEventHandler((event) => {
  requireUser(event)

  const id = Number(getRouterParam(event, 'id'))
  if (!Number.isFinite(id)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid user id' })
  }

  const db = useDatabase()
  const [deleted] = db.delete(users).where(eq(users.id, id)).returning({ id: users.id }).all()

  if (!deleted) {
    throw createError({ statusCode: 404, statusMessage: 'User not found' })
  }

  return { success: true }
})
