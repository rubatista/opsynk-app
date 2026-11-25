import { and, eq, gte } from 'drizzle-orm'
import { useDatabase } from '../../database/client'
import { pageViews } from '../../database/schema'

const DAYS = 30

export default defineEventHandler((event) => {
  const { tenantId } = requireTenant(event)

  const start = new Date()
  start.setDate(start.getDate() - (DAYS - 1))
  const startDate = start.toISOString().slice(0, 10)

  const db = useDatabase()
  const rows = db
    .select()
    .from(pageViews)
    .where(and(eq(pageViews.tenantId, tenantId), gte(pageViews.date, startDate)))
    .all()
  const countByDate = new Map(rows.map((row: any) => [row.date, row.count]))

  const series = []
  for (let i = 0; i < DAYS; i++) {
    const d = new Date(start)
    d.setDate(start.getDate() + i)
    const date = d.toISOString().slice(0, 10)
    series.push({ date, count: countByDate.get(date) || 0 })
  }

  return series
})
