import { useDatabase } from '../../../database/client'
import { siteSettings, tenants, users } from '../../../database/schema'

export default defineEventHandler(async (event) => {
  requireSuperadmin(event)

  const body = await readBody(event)
  const fields = parseTenantCreateInput(body)
  const user = await parseTenantUserInput(body?.user)

  const db = useDatabase()

  try {
    const created = db.transaction((tx) => {
      const [tenant] = tx.insert(tenants).values(fields).returning().all()
      tx.insert(siteSettings).values({ tenantId: tenant.id, companyName: tenant.name, metaTitle: tenant.name }).run()
      tx.insert(users).values({ tenantId: tenant.id, role: 'admin', ...user }).run()
      return tenant
    })

    setResponseStatus(event, 201)
    return created
  } catch (err) {
    rethrowAdminConstraintError(err)
  }
})
