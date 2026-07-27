import { useDatabase } from '../../database/client'
import { products } from '../../database/schema'

export default defineEventHandler(() => {
  const db = useDatabase()
  return db
    .select()
    .from(products)
    .all()
    .map((product) => attachImages(db, product))
})
