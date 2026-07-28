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
  const maintenance = db.select().from(maintenances).where(eq(maintenances.id, id)).get()

  if (!maintenance) {
    throw createError({ statusCode: 404, statusMessage: 'Maintenance not found' })
  }

  return maintenance
})
