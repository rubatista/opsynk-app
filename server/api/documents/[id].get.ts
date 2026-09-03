import { eq } from 'drizzle-orm'
import { useDatabase } from '../../database/client'
import { documents, clients } from '../../database/schema'

export default defineEventHandler((event) => {
  requireUser(event)

  const id = Number(getRouterParam(event, 'id'))
  if (!Number.isFinite(id)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid document id' })
  }

  const db = useDatabase()
  const doc = db.select().from(documents).where(eq(documents.id, id)).get()
  if (!doc) {
    throw createError({ statusCode: 404, statusMessage: 'Document not found' })
  }

  const client = doc.clientId ? db.select().from(clients).where(eq(clients.id, doc.clientId)).get() : null

  return { ...doc, client: client ? { id: client.id, name: client.name, email: client.email, phone: client.phone, address: client.address } : null }
})
