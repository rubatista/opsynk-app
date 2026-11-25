import { eq } from 'drizzle-orm'
import { useDatabase } from '../../database/client'
import { tenants, users } from '../../database/schema'

// Current tenant user and their company config (name, tags, enabled modules).
export default defineEventHandler((event) => {
  const { userId, tenantId } = requireTenant(event)

  const db = useDatabase()
  const user = db
    .select({ id: users.id, email: users.email, name: users.name, role: users.role })
    .from(users)
    .where(eq(users.id, userId))
    .get()
  const tenant = db.select().from(tenants).where(eq(tenants.id, tenantId)).get()!

  return { user, tenant: publicTenantInfo(tenant) }
})
