import { eq } from 'drizzle-orm'
import { useDatabase } from '../../database/client'
import { leads, maintenances, rentals } from '../../database/schema'

export default defineEventHandler((event) => {
  requireUser(event)

  const db = useDatabase()

  const today = new Date().toISOString().slice(0, 10)
  const in30Days = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)

  const newLeads = db.select().from(leads).where(eq(leads.status, 'novo')).all().length

  const maintenanceRows = db.select().from(maintenances).all()
  const maintenancesOverdue = maintenanceRows.filter((m) => m.nextDueDate && m.nextDueDate < today).length
  const maintenancesUpcoming = maintenanceRows.filter((m) => m.nextDueDate && m.nextDueDate >= today && m.nextDueDate <= in30Days).length

  const rentalRows = db.select().from(rentals).where(eq(rentals.status, 'ativo')).all()
  const rentalsEnding = rentalRows.filter((r) => r.endDate && r.endDate <= in30Days).length

  return {
    newLeads,
    maintenancesOverdue,
    maintenancesUpcoming,
    rentalsEnding,
    bellCount: maintenancesOverdue + maintenancesUpcoming + rentalsEnding,
  }
})
