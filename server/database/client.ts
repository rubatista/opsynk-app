import { drizzle } from 'drizzle-orm/better-sqlite3'
import Database from 'better-sqlite3'
import { mkdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import * as schema from './schema'

const dbPath = resolve(process.cwd(), '.data/opsynk.db')

let instance: ReturnType<typeof drizzle<typeof schema>> | null = null

export function useDatabase() {
  if (!instance) {
    mkdirSync(dirname(dbPath), { recursive: true })
    const sqlite = new Database(dbPath)
    sqlite.pragma('journal_mode = WAL')
    sqlite.pragma('foreign_keys = ON')
    instance = drizzle(sqlite, { schema })
  }
  return instance
}
