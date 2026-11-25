import { useDatabase } from '../../../database/client'
import { clients, clientNotes } from '../../../database/schema'

export default defineEventHandler(async (event) => {
  const { tenantId } = requireTenant(event)

  const clientId = Number(getRouterParam(event, 'id'))
  if (!Number.isFinite(clientId)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid client id' })
  }

  const body = await readBody(event)
  const content = typeof body?.content === 'string' ? body.content.trim() : ''
  if (!content) {
    throw createError({ statusCode: 400, statusMessage: 'content is required' })
  }

  requireOwned(clients, clientId, tenantId, 'Client not found')

  const db = useDatabase()
  const [created] = db.insert(clientNotes).values({ tenantId, clientId, content }).returning().all()

  setResponseStatus(event, 201)
  return created
})
