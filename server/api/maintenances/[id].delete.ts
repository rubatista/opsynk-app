import { eq } from 'drizzle-orm'
import { useDatabase } from '../../database/client'
import { maintenances } from '../../database/schema'

export default defineEventHandler((event) => {
  requireUser(event)

  const id = Number(getRouterParam(event, 'id'))
  if (!Number.isFinite(id)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid maintenance id' })
  }

  const db = useDatabase()
  const [deleted] = db.delete(maintenances).where(eq(maintenances.id, id)).returning().all()

  if (!deleted) {
    throw createError({ statusCode: 404, statusMessage: 'Maintenance not found' })
  }

  return { success: true }
})
