import { eq } from 'drizzle-orm'
import { useDatabase } from '../../database/client'
import { clients } from '../../database/schema'

export default defineEventHandler((event) => {
  requireUser(event)

  const id = Number(getRouterParam(event, 'id'))
  if (!Number.isFinite(id)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid client id' })
  }

  const db = useDatabase()
  const client = db.select().from(clients).where(eq(clients.id, id)).get()

  if (!client) {
    throw createError({ statusCode: 404, statusMessage: 'Client not found' })
  }

  return client
})
