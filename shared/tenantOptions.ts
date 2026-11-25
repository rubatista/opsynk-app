// Catalog of per-tenant configuration options, shared by the app and the server.

export const BUSINESS_TAGS = [
  { value: 'stand_auto', label: 'Stand de automóveis usados' },
  { value: 'motas', label: 'Motas' },
  { value: 'mecanica', label: 'Oficina / Mecânica' },
  { value: 'pecas', label: 'Peças' },
  { value: 'maquinas', label: 'Máquinas e empilhadores' },
] as const

export type BusinessTag = (typeof BUSINESS_TAGS)[number]['value']

// Optional backoffice modules. Core modules (produtos, clientes, finanças,
// documentos, leads, utilizadores, definições) are always enabled.
export const TENANT_MODULES = [
  { value: 'alugueres', label: 'Alugueres' },
  { value: 'equipamentos', label: 'Equipamentos de clientes' },
  { value: 'manutencoes', label: 'Manutenções' },
] as const

export type TenantModule = (typeof TENANT_MODULES)[number]['value']

// Modules suggested when a business tag is picked for a new tenant.
export const TAG_DEFAULT_MODULES: Record<BusinessTag, TenantModule[]> = {
  stand_auto: [],
  motas: [],
  mecanica: ['equipamentos', 'manutencoes'],
  pecas: [],
  maquinas: ['alugueres', 'equipamentos', 'manutencoes'],
}

export const TENANT_STATUSES = [
  { value: 'ativo', label: 'Ativo' },
  { value: 'suspenso', label: 'Suspenso' },
] as const

export type TenantStatus = (typeof TENANT_STATUSES)[number]['value']

// Subdomains that can never be used as a tenant slug.
export const RESERVED_SLUGS = ['www', 'app', 'admin', 'api', 'mail', 'static', 'cdn', 'opsynk']

export const SLUG_PATTERN = /^[a-z0-9](?:[a-z0-9-]{0,38}[a-z0-9])?$/
