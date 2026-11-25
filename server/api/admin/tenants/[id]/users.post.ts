import { eq } from 'drizzle-orm'
import { useDatabase } from '../../../../database/client'
import { tenants, users } from '../../../../database/schema'

export default defineEventHandler(async (event) => {
  requireSuperadmin(event)

  const tenantId = Number(getRouterParam(event, 'id'))
  if (!Number.isFinite(tenantId)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid tenant id' })
  }

  const db = useDatabase()
  const tenant = db.select({ id: tenants.id }).from(tenants).where(eq(tenants.id, tenantId)).get()
  if (!tenant) {
    throw createError({ statusCode: 404, statusMessage: 'Empresa não encontrada' })
  }

  const body = await readBody(event)
  const user = await parseTenantUserInput(body)

  try {
    const [created] = db
      .insert(users)
      .values({ tenantId, role: 'admin', ...user })
      .returning({ id: users.id, name: users.name, email: users.email, createdAt: users.createdAt })
      .all()

    setResponseStatus(event, 201)
    return created
  } catch (err) {
    rethrowAdminConstraintError(err)
  }
})
