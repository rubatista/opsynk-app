import { useDatabase } from '../../database/client'
import { leads } from '../../database/schema'

export default defineEventHandler((event) => {
  requireUser(event)

  const db = useDatabase()
  const rows = db.select().from(leads).all()

  return rows.sort((a: any, b: any) => {
    if (a.status !== b.status) return a.status === 'novo' ? -1 : 1
    return b.createdAt.localeCompare(a.createdAt)
  })
})
