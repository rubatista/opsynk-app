import { eq } from 'drizzle-orm'
import { useDatabase } from '../../database/client'
import { maintenances, equipment, clients } from '../../database/schema'

export default defineEventHandler((event) => {
  requireUser(event)

  const query = getQuery(event)
  const equipmentId = query.equipmentId ? Number(query.equipmentId) : null

  const db = useDatabase()

  const rows = equipmentId
    ? db.select().from(maintenances).where(eq(maintenances.equipmentId, equipmentId)).all()
    : db.select().from(maintenances).all()

  const equipmentRows = db.select().from(equipment).all()
  const equipmentMap = new Map(equipmentRows.map((item: any) => [item.id, item]))

  const clientRows = db.select().from(clients).all()
  const clientMap = new Map(clientRows.map((client: any) => [client.id, client]))

  const withEquipment = rows.map((row: any) => {
    const item = equipmentMap.get(row.equipmentId)
    const client = item?.clientId ? clientMap.get(item.clientId) : null
    return {
      ...row,
      equipment: item
        ? {
            id: item.id,
            brand: item.brand,
            model: item.model,
            ownerName: item.ownerName,
            client: client ? { id: client.id, name: client.name } : null,
          }
        : null,
    }
  })

  return withEquipment.sort((a: any, b: any) => {
    if (!a.nextDueDate && !b.nextDueDate) return 0
    if (!a.nextDueDate) return 1
    if (!b.nextDueDate) return -1
    return a.nextDueDate.localeCompare(b.nextDueDate)
  })
})
