import { eq } from 'drizzle-orm'
import { useDatabase } from '../../database/client'
import { clientTransactions, clients } from '../../database/schema'

const TYPES = ['a_receber', 'a_pagar'] as const

export default defineEventHandler(async (event) => {
  requireUser(event)

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

  const db = useDatabase()
  const client = db.select().from(clients).where(eq(clients.id, clientId)).get()
  if (!client) {
    throw createError({ statusCode: 404, statusMessage: 'Client not found' })
  }

  const [created] = db
    .insert(clientTransactions)
    .values({ clientId, type, amount, description, date })
    .returning()
    .all()

  setResponseStatus(event, 201)
  return created
})
