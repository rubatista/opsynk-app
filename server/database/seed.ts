import bcrypt from 'bcryptjs'
import { eq } from 'drizzle-orm'
import { useDatabase } from './client'
import { siteSettings, tenants, users } from './schema'

// Dev seed: the platform superadmin plus two demo tenants to test isolation.
const PASSWORD = 'password123'

const DEMO_TENANTS = [
  {
    name: 'Opsynk Empilhadores',
    slug: 'demo',
    businessTags: ['maquinas'],
    modules: ['alugueres', 'equipamentos', 'manutencoes'],
    metaDescription: 'Venda, aluguer e manutenção de empilhadores.',
    user: { email: 'demo@opsynk.com', name: 'Demo Empilhadores' },
  },
  {
    name: 'Stand Exemplo',
    slug: 'stand-exemplo',
    businessTags: ['stand_auto', 'mecanica'],
    modules: ['equipamentos', 'manutencoes'],
    metaDescription: 'Automóveis usados e oficina.',
    user: { email: 'stand@opsynk.com', name: 'Stand Exemplo' },
  },
]

async function seed() {
  const db = useDatabase()
  const passwordHash = await bcrypt.hash(PASSWORD, 10)

  const superadminEmail = 'admin@opsynk.com'
  if (!db.select().from(users).where(eq(users.email, superadminEmail)).get()) {
    db.insert(users).values({ email: superadminEmail, passwordHash, name: 'Opsynk Admin', role: 'superadmin', tenantId: null }).run()
    console.log(`Superadmin: ${superadminEmail} / ${PASSWORD}  →  /admin`)
  }

  for (const demo of DEMO_TENANTS) {
    if (db.select().from(tenants).where(eq(tenants.slug, demo.slug)).get()) {
      console.log(`Tenant ${demo.slug} already exists, skipping.`)
      continue
    }

    db.transaction((tx) => {
      const [tenant] = tx
        .insert(tenants)
        .values({ name: demo.name, slug: demo.slug, businessTags: demo.businessTags, modules: demo.modules })
        .returning()
        .all()
      tx.insert(siteSettings)
        .values({ tenantId: tenant.id, companyName: demo.name, metaTitle: demo.name, metaDescription: demo.metaDescription })
        .run()
      tx.insert(users)
        .values({ tenantId: tenant.id, role: 'admin', email: demo.user.email, name: demo.user.name, passwordHash })
        .run()
    })

    console.log(`Tenant ${demo.name}: ${demo.user.email} / ${PASSWORD}  →  http://${demo.slug}.localhost:3000`)
  }
}

seed()
