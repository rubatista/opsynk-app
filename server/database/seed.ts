import bcrypt from 'bcryptjs'
import { useDatabase } from './client'
import { users } from './schema'
import { eq } from 'drizzle-orm'

async function seed() {
  const db = useDatabase()

  const email = 'admin@opsynk.com'
  const password = 'password123'

  const existing = db.select().from(users).where(eq(users.email, email)).get()
  if (existing) {
    console.log(`User ${email} already exists, skipping.`)
    return
  }

  const passwordHash = await bcrypt.hash(password, 10)
  db.insert(users).values({ email, passwordHash, name: 'Admin' }).run()

  console.log(`Seeded user ${email} / ${password}`)
}

seed()
