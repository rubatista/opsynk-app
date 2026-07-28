import { eq } from 'drizzle-orm'
import { useDatabase } from '../../database/client'
import { equipment } from '../../database/schema'

export default defineEventHandler((event) => {
  requireUser(event)

  const id = Number(getRouterParam(event, 'id'))
  if (!Number.isFinite(id)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid equipment id' })
  }

  const db = useDatabase()
  const [deleted] = db.delete(equipment).where(eq(equipment.id, id)).returning().all()

  if (!deleted) {
    throw createError({ statusCode: 404, statusMessage: 'Equipment not found' })
  }

  return { success: true }
})
