import { eq } from 'drizzle-orm'
import { useDatabase } from '../../database/client'
import { documents, clients } from '../../database/schema'

export default defineEventHandler((event) => {
  const { tenantId } = requireTenant(event)

  const db = useDatabase()
  const rows = db.select().from(documents).where(eq(documents.tenantId, tenantId)).all()

  const clientRows = db.select().from(clients).where(eq(clients.tenantId, tenantId)).all()
  const clientMap = new Map(clientRows.map((client: any) => [client.id, client]))

  const withClient = rows.map((row: any) => ({
    ...row,
    client: row.clientId && clientMap.has(row.clientId) ? { id: row.clientId, name: clientMap.get(row.clientId).name } : null,
  }))

  return withClient.sort((a: any, b: any) => b.createdAt.localeCompare(a.createdAt))
})
