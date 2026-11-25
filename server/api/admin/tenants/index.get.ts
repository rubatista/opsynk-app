import { count, desc } from 'drizzle-orm'
import { useDatabase } from '../../../database/client'
import { products, tenants, users } from '../../../database/schema'

export default defineEventHandler((event) => {
  requireSuperadmin(event)

  const db = useDatabase()
  const rows = db.select().from(tenants).orderBy(desc(tenants.createdAt), desc(tenants.id)).all()

  const userCounts = new Map(
    db
      .select({ tenantId: users.tenantId, total: count() })
      .from(users)
      .groupBy(users.tenantId)
      .all()
      .map((row) => [row.tenantId, row.total])
  )
  const productCounts = new Map(
    db
      .select({ tenantId: products.tenantId, total: count() })
      .from(products)
      .groupBy(products.tenantId)
      .all()
      .map((row) => [row.tenantId, row.total])
  )

  return rows.map((tenant) => ({
    id: tenant.id,
    name: tenant.name,
    slug: tenant.slug,
    domain: tenant.domain,
    businessTags: tenant.businessTags,
    modules: tenant.modules,
    status: tenant.status,
    createdAt: tenant.createdAt,
    userCount: userCounts.get(tenant.id) || 0,
    productCount: productCounts.get(tenant.id) || 0,
  }))
})
