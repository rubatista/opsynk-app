import { asc, eq } from 'drizzle-orm'
import { useDatabase } from '../../../database/client'
import { tenants, users } from '../../../database/schema'

export default defineEventHandler((event) => {
  requireSuperadmin(event)

  const id = Number(getRouterParam(event, 'id'))
  if (!Number.isFinite(id)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid tenant id' })
  }

  const db = useDatabase()
  const tenant = db.select().from(tenants).where(eq(tenants.id, id)).get()
  if (!tenant) {
    throw createError({ statusCode: 404, statusMessage: 'Empresa não encontrada' })
  }

  const tenantUsers = db
    .select({ id: users.id, name: users.name, email: users.email, createdAt: users.createdAt })
    .from(users)
    .where(eq(users.tenantId, id))
    .orderBy(asc(users.createdAt), asc(users.id))
    .all()

  return { ...tenant, users: tenantUsers }
})
