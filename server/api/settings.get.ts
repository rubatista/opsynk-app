import { useDatabase } from '../database/client'
import { siteSettings } from '../database/schema'

const DEFAULTS = {
  metaTitle: 'Opsynk Empilhadores',
  metaDescription: 'Venda, aluguer e manutenção de empilhadores.',
  ogImage: null as string | null,
  companyName: null as string | null,
  companyNif: null as string | null,
  companyAddress: null as string | null,
  companyPhone: null as string | null,
  companyEmail: null as string | null,
}

export default defineEventHandler(() => {
  const db = useDatabase()
  const row = db.select().from(siteSettings).get()
  return row ?? DEFAULTS
})
