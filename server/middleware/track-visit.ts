import { sql } from 'drizzle-orm'
import { useDatabase } from '../database/client'
import { pageViews } from '../database/schema'

const EXCLUDED_PREFIXES = ['/api', '/_nuxt', '/uploads', '/backoffice', '/__nuxt_devtools__']
const HAS_EXTENSION = /\.[a-zA-Z0-9]+$/

export default defineEventHandler((event) => {
  if (event.node.req.method !== 'GET') return

  const path = (event.node.req.url || '').split('?')[0]
  if (EXCLUDED_PREFIXES.some((prefix) => path.startsWith(prefix))) return
  if (HAS_EXTENSION.test(path)) return

  const accept = getHeader(event, 'accept') || ''
  if (!accept.includes('text/html')) return

  const today = new Date().toISOString().slice(0, 10)
  const db = useDatabase()

  db.insert(pageViews)
    .values({ date: today, count: 1 })
    .onConflictDoUpdate({ target: pageViews.date, set: { count: sql`${pageViews.count} + 1` } })
    .run()
})
