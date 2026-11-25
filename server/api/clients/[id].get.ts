import { clients } from '../../database/schema'

export default defineEventHandler((event) => {
  const { tenantId } = requireTenant(event)

  const id = Number(getRouterParam(event, 'id'))
  if (!Number.isFinite(id)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid client id' })
  }

  return requireOwned(clients, id, tenantId, 'Client not found')
})
