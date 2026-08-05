import { eq, desc } from 'drizzle-orm'
import { useDatabase } from '../../../database/client'
import { clientNotes } from '../../../database/schema'

export default defineEventHandler((event) => {
  requireUser(event)

  const clientId = Number(getRouterParam(event, 'id'))
  if (!Number.isFinite(clientId)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid client id' })
  }

  const db = useDatabase()
  return db
    .select()
    .from(clientNotes)
    .where(eq(clientNotes.clientId, clientId))
    .orderBy(desc(clientNotes.createdAt))
    .all()
})
