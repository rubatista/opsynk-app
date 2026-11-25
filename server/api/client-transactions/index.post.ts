import { useDatabase } from '../../database/client'
import { clientTransactions, clients } from '../../database/schema'

const TYPES = ['a_receber', 'a_pagar'] as const

export default defineEventHandler(async (event) => {
  const { tenantId } = requireTenant(event)

  const body = await readBody(event)
  const clientId = Number(body?.clientId)
  const type = body?.type
  const amount = Number(body?.amount)
  const description = typeof body?.description === 'string' ? body.description.trim() : ''
  const date = typeof body?.date === 'string' ? body.date : ''

  if (!Number.isFinite(clientId) || !TYPES.includes(type) || !Number.isFinite(amount) || amount <= 0 || !description || !date) {
    throw createError({
      statusCode: 400,
      statusMessage: 'clientId, type (a_receber|a_pagar), amount, description and date are required',
    })
  }

  requireOwned(clients, clientId, tenantId, 'Client not found')

  const db = useDatabase()
  const [created] = db
    .insert(clientTransactions)
    .values({ tenantId, clientId, type, amount, description, date })
    .returning()
    .all()

  setResponseStatus(event, 201)
  return created
})
