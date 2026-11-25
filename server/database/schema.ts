import { sqliteTable, text, integer, real, index, uniqueIndex, primaryKey } from 'drizzle-orm/sqlite-core'
import { sql } from 'drizzle-orm'

// Every business table carries tenant_id. All reads and writes made on behalf of a
// tenant must filter by it — see server/utils/auth.ts (requireTenant) and
// server/utils/tenant.ts (findOwned / ownedIdOrNull).

export const tenants = sqliteTable('tenants', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  domain: text('domain').unique(),
  businessTags: text('business_tags', { mode: 'json' }).$type<string[]>().notNull().default(sql`'[]'`),
  modules: text('modules', { mode: 'json' }).$type<string[]>().notNull().default(sql`'[]'`),
  status: text('status').notNull().default('ativo'),
  createdAt: text('created_at').notNull().default(sql`(current_timestamp)`),
  updatedAt: text('updated_at').notNull().default(sql`(current_timestamp)`),
})

const tenantId = () =>
  integer('tenant_id')
    .notNull()
    .references(() => tenants.id, { onDelete: 'cascade' })

export const users = sqliteTable(
  'users',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    // Null for platform superadmins, set for every tenant user.
    tenantId: integer('tenant_id').references(() => tenants.id, { onDelete: 'cascade' }),
    role: text('role').notNull().default('admin'),
    email: text('email').notNull().unique(),
    passwordHash: text('password_hash').notNull(),
    name: text('name'),
    createdAt: text('created_at').notNull().default(sql`(current_timestamp)`),
  },
  (t) => [index('users_tenant_idx').on(t.tenantId)]
)

export const products = sqliteTable(
  'products',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    tenantId: tenantId(),
    name: text('name').notNull(),
    description: text('description'),
    price: real('price').notNull(),
    stock: integer('stock').notNull().default(0),
    brand: text('brand'),
    model: text('model'),
    capacityKg: integer('capacity_kg'),
    energyType: text('energy_type'),
    year: integer('year'),
    listingType: text('listing_type').notNull().default('venda'),
    metaTitle: text('meta_title'),
    metaDescription: text('meta_description'),
    createdAt: text('created_at').notNull().default(sql`(current_timestamp)`),
    updatedAt: text('updated_at').notNull().default(sql`(current_timestamp)`),
  },
  (t) => [index('products_tenant_idx').on(t.tenantId)]
)

export const productImages = sqliteTable(
  'product_images',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    tenantId: tenantId(),
    productId: integer('product_id')
      .notNull()
      .references(() => products.id, { onDelete: 'cascade' }),
    url: text('url').notNull(),
    position: integer('position').notNull().default(0),
    createdAt: text('created_at').notNull().default(sql`(current_timestamp)`),
  },
  (t) => [index('product_images_tenant_idx').on(t.tenantId), index('product_images_product_idx').on(t.productId)]
)

export const siteSettings = sqliteTable('site_settings', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  tenantId: tenantId().unique(),
  metaTitle: text('meta_title'),
  metaDescription: text('meta_description'),
  ogImage: text('og_image'),
  companyName: text('company_name'),
  companyNif: text('company_nif'),
  companyAddress: text('company_address'),
  companyPhone: text('company_phone'),
  companyEmail: text('company_email'),
  updatedAt: text('updated_at').notNull().default(sql`(current_timestamp)`),
})

export const clients = sqliteTable(
  'clients',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    tenantId: tenantId(),
    name: text('name').notNull(),
    phone: text('phone'),
    email: text('email'),
    address: text('address'),
    notes: text('notes'),
    createdAt: text('created_at').notNull().default(sql`(current_timestamp)`),
  },
  (t) => [index('clients_tenant_idx').on(t.tenantId)]
)

export const equipment = sqliteTable(
  'equipment',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    tenantId: tenantId(),
    brand: text('brand').notNull(),
    model: text('model').notNull(),
    serialNumber: text('serial_number'),
    ownerName: text('owner_name'),
    ownerContact: text('owner_contact'),
    clientId: integer('client_id').references(() => clients.id, { onDelete: 'set null' }),
    productId: integer('product_id').references(() => products.id, { onDelete: 'set null' }),
    notes: text('notes'),
    createdAt: text('created_at').notNull().default(sql`(current_timestamp)`),
  },
  (t) => [index('equipment_tenant_idx').on(t.tenantId)]
)

export const maintenances = sqliteTable(
  'maintenances',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    tenantId: tenantId(),
    equipmentId: integer('equipment_id')
      .notNull()
      .references(() => equipment.id, { onDelete: 'cascade' }),
    performedAt: text('performed_at').notNull(),
    description: text('description').notNull(),
    nextDueDate: text('next_due_date'),
    nextDueNotes: text('next_due_notes'),
    createdAt: text('created_at').notNull().default(sql`(current_timestamp)`),
  },
  (t) => [index('maintenances_tenant_idx').on(t.tenantId)]
)

export const rentals = sqliteTable(
  'rentals',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    tenantId: tenantId(),
    productId: integer('product_id')
      .notNull()
      .references(() => products.id, { onDelete: 'cascade' }),
    clientId: integer('client_id').references(() => clients.id, { onDelete: 'set null' }),
    renterName: text('renter_name'),
    renterContact: text('renter_contact'),
    startDate: text('start_date').notNull(),
    endDate: text('end_date'),
    status: text('status').notNull().default('ativo'),
    notes: text('notes'),
    createdAt: text('created_at').notNull().default(sql`(current_timestamp)`),
  },
  (t) => [index('rentals_tenant_idx').on(t.tenantId)]
)

export const sales = sqliteTable(
  'sales',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    tenantId: tenantId(),
    productId: integer('product_id')
      .notNull()
      .references(() => products.id, { onDelete: 'cascade' }),
    clientId: integer('client_id').references(() => clients.id, { onDelete: 'set null' }),
    buyerName: text('buyer_name'),
    buyerContact: text('buyer_contact'),
    price: real('price').notNull(),
    amountDue: real('amount_due').notNull().default(0),
    date: text('date').notNull(),
    notes: text('notes'),
    createdAt: text('created_at').notNull().default(sql`(current_timestamp)`),
  },
  (t) => [index('sales_tenant_idx').on(t.tenantId)]
)

export const leads = sqliteTable(
  'leads',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    tenantId: tenantId(),
    name: text('name').notNull(),
    email: text('email'),
    phone: text('phone'),
    message: text('message').notNull(),
    status: text('status').notNull().default('novo'),
    createdAt: text('created_at').notNull().default(sql`(current_timestamp)`),
  },
  (t) => [index('leads_tenant_idx').on(t.tenantId)]
)

export const pageViews = sqliteTable(
  'page_views',
  {
    tenantId: tenantId(),
    date: text('date').notNull(),
    count: integer('count').notNull().default(0),
  },
  (t) => [primaryKey({ columns: [t.tenantId, t.date] })]
)

export const clientNotes = sqliteTable(
  'client_notes',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    tenantId: tenantId(),
    clientId: integer('client_id')
      .notNull()
      .references(() => clients.id, { onDelete: 'cascade' }),
    content: text('content').notNull(),
    createdAt: text('created_at').notNull().default(sql`(current_timestamp)`),
  },
  (t) => [index('client_notes_tenant_idx').on(t.tenantId)]
)

export const clientTransactions = sqliteTable(
  'client_transactions',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    tenantId: tenantId(),
    clientId: integer('client_id')
      .notNull()
      .references(() => clients.id, { onDelete: 'cascade' }),
    type: text('type').notNull(),
    amount: real('amount').notNull(),
    description: text('description').notNull(),
    date: text('date').notNull(),
    status: text('status').notNull().default('pendente'),
    saleId: integer('sale_id').references(() => sales.id, { onDelete: 'cascade' }),
    createdAt: text('created_at').notNull().default(sql`(current_timestamp)`),
  },
  (t) => [index('client_transactions_tenant_idx').on(t.tenantId)]
)

export const transactionPayments = sqliteTable(
  'transaction_payments',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    tenantId: tenantId(),
    transactionId: integer('transaction_id')
      .notNull()
      .references(() => clientTransactions.id, { onDelete: 'cascade' }),
    amount: real('amount').notNull(),
    date: text('date').notNull(),
    notes: text('notes'),
    createdAt: text('created_at').notNull().default(sql`(current_timestamp)`),
  },
  (t) => [index('transaction_payments_tenant_idx').on(t.tenantId)]
)

export const documents = sqliteTable(
  'documents',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    tenantId: tenantId(),
    type: text('type').notNull(),
    // Unique per tenant: each company keeps its own FT/ORC sequence.
    number: text('number').notNull(),
    sourceType: text('source_type'),
    sourceId: integer('source_id'),
    clientId: integer('client_id').references(() => clients.id, { onDelete: 'set null' }),
    buyerName: text('buyer_name'),
    buyerContact: text('buyer_contact'),
    description: text('description').notNull(),
    amount: real('amount').notNull(),
    date: text('date').notNull(),
    notes: text('notes'),
    createdAt: text('created_at').notNull().default(sql`(current_timestamp)`),
  },
  (t) => [uniqueIndex('documents_tenant_number_unique').on(t.tenantId, t.number)]
)
