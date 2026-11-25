import { and, eq } from 'drizzle-orm'
import { useDatabase } from '../../database/client'
import { clients } from '../../database/schema'

export default defineEventHandler(async (event) => {
  const { tenantId } = requireTenant(event)

  const id = Number(getRouterParam(event, 'id'))
  if (!Number.isFinite(id)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid client id' })
  }

  const body = await readBody(event)
  const updates: Record<string, any> = {}

  if (typeof body?.name === 'string' && body.name.trim()) updates.name = body.name.trim()
  if (body?.phone !== undefined) updates.phone = typeof body.phone === 'string' ? body.phone.trim() || null : null
  if (body?.email !== undefined) updates.email = typeof body.email === 'string' ? body.email.trim() || null : null
  if (body?.address !== undefined) updates.address = typeof body.address === 'string' ? body.address.trim() || null : null
  if (body?.notes !== undefined) updates.notes = typeof body.notes === 'string' ? body.notes.trim() || null : null

  const existing = requireOwned(clients, id, tenantId, 'Client not found')
  if (!Object.keys(updates).length) return existing

  const db = useDatabase()
  const [updated] = db
    .update(clients)
    .set(updates)
    .where(and(eq(clients.id, id), eq(clients.tenantId, tenantId)))
    .returning()
    .all()

  return updated
})
