import { documents, clients } from '../../database/schema'

export default defineEventHandler((event) => {
  const { tenantId } = requireTenant(event)

  const id = Number(getRouterParam(event, 'id'))
  if (!Number.isFinite(id)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid document id' })
  }

  const doc = requireOwned(documents, id, tenantId, 'Document not found')
  const client = doc.clientId ? findOwned(clients, doc.clientId, tenantId) : null

  return { ...doc, client: client ? { id: client.id, name: client.name, email: client.email, phone: client.phone, address: client.address } : null }
})
