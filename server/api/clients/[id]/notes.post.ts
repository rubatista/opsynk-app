import { eq } from 'drizzle-orm'
import { useDatabase } from '../../../database/client'
import { clients, clientNotes } from '../../../database/schema'

export default defineEventHandler(async (event) => {
  requireUser(event)

  const clientId = Number(getRouterParam(event, 'id'))
  if (!Number.isFinite(clientId)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid client id' })
  }

  const body = await readBody(event)
  const content = typeof body?.content === 'string' ? body.content.trim() : ''
  if (!content) {
    throw createError({ statusCode: 400, statusMessage: 'content is required' })
  }

  const db = useDatabase()
  const client = db.select().from(clients).where(eq(clients.id, clientId)).get()
  if (!client) {
    throw createError({ statusCode: 404, statusMessage: 'Client not found' })
  }

  const [created] = db.insert(clientNotes).values({ clientId, content }).returning().all()

  setResponseStatus(event, 201)
  return created
})
