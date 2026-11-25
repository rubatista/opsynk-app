import { eq, sql } from 'drizzle-orm'
import { useDatabase } from '../../../database/client'
import { tenants } from '../../../database/schema'

export default defineEventHandler(async (event) => {
  requireSuperadmin(event)

  const id = Number(getRouterParam(event, 'id'))
  if (!Number.isFinite(id)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid tenant id' })
  }

  const body = await readBody(event)
  const updates = parseTenantUpdateInput(body)

  const db = useDatabase()

  try {
    const [updated] = db
      .update(tenants)
      .set({ ...updates, updatedAt: sql`(current_timestamp)` })
      .where(eq(tenants.id, id))
      .returning()
      .all()

    if (!updated) {
      throw createError({ statusCode: 404, statusMessage: 'Empresa não encontrada' })
    }

    return updated
  } catch (err) {
    rethrowAdminConstraintError(err)
  }
})
