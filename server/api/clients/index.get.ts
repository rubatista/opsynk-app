import { eq } from 'drizzle-orm'
import { useDatabase } from '../../database/client'
import { clients } from '../../database/schema'

export default defineEventHandler((event) => {
  const { tenantId } = requireTenant(event)

  const db = useDatabase()
  return db.select().from(clients).where(eq(clients.tenantId, tenantId)).all()
})
