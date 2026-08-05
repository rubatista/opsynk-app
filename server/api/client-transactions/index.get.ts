import { eq } from 'drizzle-orm'
import { useDatabase } from '../../database/client'
import { clientTransactions, clients } from '../../database/schema'

export default defineEventHandler((event) => {
  requireUser(event)

  const query = getQuery(event)
  const clientId = query.clientId ? Number(query.clientId) : null

  const db = useDatabase()
  const rows = clientId
    ? db.select().from(clientTransactions).where(eq(clientTransactions.clientId, clientId)).all()
    : db.select().from(clientTransactions).all()

  const clientRows = db.select().from(clients).all()
  const clientMap = new Map(clientRows.map((client: any) => [client.id, client]))

  const withClient = rows.map((row: any) => ({
    ...row,
    client: clientMap.has(row.clientId) ? { id: row.clientId, name: clientMap.get(row.clientId).name } : null,
  }))

  return withClient.sort((a: any, b: any) => {
    if (a.status !== b.status) return a.status === 'pendente' ? -1 : 1
    return b.date.localeCompare(a.date)
  })
})
