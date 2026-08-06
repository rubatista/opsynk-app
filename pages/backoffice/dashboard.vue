<script setup lang="ts">
import BaseCard from '~/components/atoms/BaseCard/BaseCard.vue'
import BaseButton from '~/components/atoms/BaseButton/BaseButton.vue'
import VisitsChart from '~/components/sections/VisitsChart/VisitsChart.vue'

definePageMeta({ layout: 'backoffice', title: 'Dashboard' })

const ICONS = {
  produtos: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4',
  utilizadores: 'M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87m6-1.13a4 4 0 10-4-4 4 4 0 004 4zm6 0a4 4 0 10-3-6.65',
  manutencoes: 'M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z',
  alugueres: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
  leads: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
  finanças: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V6m0 2v8m0 0v2m0-2c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
}

const [products, users, maintenances, rentals, leads, clientTransactions] = await Promise.all([
  useAuthFetch<any[]>('/api/products'),
  useAuthFetch<any[]>('/api/users'),
  useAuthFetch<any[]>('/api/maintenances'),
  useAuthFetch<any[]>('/api/rentals'),
  useAuthFetch<any[]>('/api/leads'),
  useAuthFetch<any[]>('/api/client-transactions'),
])

const today = new Date().toISOString().slice(0, 10)
const in30Days = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
const upcomingMaintenances = maintenances.filter((m) => m.nextDueDate && m.nextDueDate <= in30Days).length
const endingRentals = rentals.filter((r) => r.status === 'ativo' && r.endDate && r.endDate <= in30Days).length
const newLeads = leads.filter((l) => l.status === 'novo').length

const pendingReceber = clientTransactions
  .filter((t) => t.type === 'a_receber' && t.status === 'pendente')
  .reduce((sum, t) => sum + t.amount, 0)
const pendingPagar = clientTransactions
  .filter((t) => t.type === 'a_pagar' && t.status === 'pendente')
  .reduce((sum, t) => sum + t.amount, 0)

const statCards = [
  { label: 'Produtos', value: String(products.length), icon: ICONS.produtos, href: '/backoffice/produtos' },
  { label: 'Utilizadores', value: String(users.length), icon: ICONS.utilizadores, href: '/backoffice/utilizadores' },
  { label: 'Manutenções em 30 dias', value: String(upcomingMaintenances), icon: ICONS.manutencoes, href: '/backoffice/manutencoes' },
  { label: 'Alugueres a terminar (30 dias)', value: String(endingRentals), icon: ICONS.alugueres, href: '/backoffice/alugueres' },
  { label: 'Novos pedidos de contacto', value: String(newLeads), icon: ICONS.leads, href: '/backoffice/leads' },
  { label: 'A receber de clientes', value: formatCurrency(pendingReceber), icon: ICONS.finanças, href: '/backoffice/finanças' },
  { label: 'A pagar a clientes', value: formatCurrency(pendingPagar), icon: ICONS.finanças, href: '/backoffice/finanças ' },
]

// Próximos prazos: manutenções + alugueres ativos, combinados e ordenados por data
const deadlines = [
  ...maintenances
    .filter((m) => m.nextDueDate)
    .map((m) => ({
      date: m.nextDueDate as string,
      type: 'Manutenção',
      icon: ICONS.manutencoes,
      label: m.equipment ? `${m.equipment.brand} ${m.equipment.model}` : 'Manutenção',
      href: `/backoffice/manutencoes/${m.id}`,
    })),
  ...rentals
    .filter((r) => r.status === 'ativo' && r.endDate)
    .map((r) => ({
      date: r.endDate as string,
      type: 'Aluguer',
      icon: ICONS.alugueres,
      label: r.product ? r.product.name : 'Aluguer',
      href: `/backoffice/alugueres/${r.id}`,
    })),
].sort((a, b) => a.date.localeCompare(b.date))

const nextDeadline = deadlines[0] || null
const deadlineList = deadlines.slice(0, 5)
const isOverdue = (date: string) => date < today

const recentLeads = [...leads].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 4)
const leadInitials = (name: string) => name.split(' ').map((part) => part[0]).slice(0, 2).join('').toUpperCase()

const vendaCount = products.filter((p) => p.listingType === 'venda').length
const aluguerCount = products.filter((p) => p.listingType === 'aluguer').length
const productTypeTotal = vendaCount + aluguerCount || 1
const vendaPct = (vendaCount / productTypeTotal) * 100
const aluguerPct = (aluguerCount / productTypeTotal) * 100
</script>

<template>
  <div>
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4">
      <NuxtLink v-for="card in statCards" :key="card.label" :to="card.href" class="block">
        <BaseCard class="h-full hover:shadow-md transition">
          <div class="flex items-center justify-between mb-3">
            <span class="w-9 h-9 rounded-xl bg-brand-500/10 text-brand-500 flex items-center justify-center">
              <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" :d="card.icon" />
              </svg>
            </span>
            <span class="w-6 h-6 rounded-full border border-gray-200 dark:border-gray-700 flex items-center justify-center text-gray-400">
              <svg class="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M7 17L17 7M17 7H9M17 7v8" />
              </svg>
            </span>
          </div>
          <p class="text-sm text-gray-500 dark:text-gray-400">{{ card.label }}</p>
          <p class="text-2xl font-bold text-gray-900 dark:text-white mt-1">{{ card.value }}</p>
        </BaseCard>
      </NuxtLink>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-6">
      <div class="lg:col-span-2">
        <VisitsChart />
      </div>

      <div class="flex flex-col gap-4">
        <BaseCard>
          <p class="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-3">Próximo Prazo</p>
          <template v-if="nextDeadline">
            <div class="flex items-center gap-3 mb-4">
              <span class="w-10 h-10 rounded-xl bg-brand-500/10 text-brand-500 flex items-center justify-center shrink-0">
                <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" :d="nextDeadline.icon" />
                </svg>
              </span>
              <div>
                <p class="font-semibold text-gray-900 dark:text-white">{{ nextDeadline.label }}</p>
                <p class="text-xs" :class="isOverdue(nextDeadline.date) ? 'text-red-500 font-semibold' : 'text-gray-400'">
                  {{ nextDeadline.type }} · {{ nextDeadline.date }}
                </p>
              </div>
            </div>
            <BaseButton :to="nextDeadline.href" variant="brand" class="w-full text-center">Ver</BaseButton>
          </template>
          <p v-else class="text-sm text-gray-400">Sem prazos agendados.</p>
        </BaseCard>

        <BaseCard>
          <p class="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-3">Próximos Prazos</p>
          <p v-if="!deadlineList.length" class="text-sm text-gray-400">Sem prazos agendados.</p>
          <ul v-else class="space-y-3">
            <li v-for="item in deadlineList" :key="item.href">
              <NuxtLink :to="item.href" class="flex items-center gap-3 group">
                <span class="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 flex items-center justify-center shrink-0">
                  <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" :d="item.icon" />
                  </svg>
                </span>
                <span class="flex-1 min-w-0">
                  <span class="block text-sm text-gray-900 dark:text-white truncate group-hover:text-brand-500 transition">{{ item.label }}</span>
                  <span class="block text-xs" :class="isOverdue(item.date) ? 'text-red-500 font-semibold' : 'text-gray-400'">{{ item.date }}</span>
                </span>
              </NuxtLink>
            </li>
          </ul>
        </BaseCard>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-6">
      <BaseCard class="lg:col-span-2">
        <div class="flex items-center justify-between mb-4">
          <p class="text-sm font-semibold text-gray-500 dark:text-gray-400">Últimos Pedidos de Contacto</p>
          <NuxtLink to="/backoffice/leads" class="text-xs text-brand-500 hover:underline">Ver todos</NuxtLink>
        </div>
        <p v-if="!recentLeads.length" class="text-sm text-gray-400">Ainda não há pedidos de contacto.</p>
        <ul v-else class="space-y-3">
          <li v-for="lead in recentLeads" :key="lead.id" class="flex items-center justify-between gap-3">
            <div class="flex items-center gap-3 min-w-0">
              <span class="w-8 h-8 rounded-full bg-brand-500 text-white text-xs font-bold flex items-center justify-center shrink-0">
                {{ leadInitials(lead.name) }}
              </span>
              <div class="min-w-0">
                <p class="text-sm text-gray-900 dark:text-white truncate">{{ lead.name }}</p>
                <p class="text-xs text-gray-400 truncate">{{ lead.email || lead.phone }}</p>
              </div>
            </div>
            <span
              class="shrink-0 inline-block px-2 py-0.5 rounded-full text-xs font-semibold"
              :class="lead.status === 'novo' ? 'bg-brand-100 text-brand-700 dark:bg-brand-500/20 dark:text-brand-300' : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'"
            >
              {{ lead.status === 'novo' ? 'Novo' : 'Contactado' }}
            </span>
          </li>
        </ul>
      </BaseCard>

      <div class="flex flex-col gap-4">
        <BaseCard>
          <p class="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-3">Produtos por Tipo</p>
          <div class="flex h-3 rounded-full overflow-hidden gap-[2px] bg-gray-100 dark:bg-gray-800">
            <div class="bg-brand-500 rounded-full" :style="{ width: vendaPct + '%' }" />
            <div class="bg-gray-300 dark:bg-gray-600 rounded-full" :style="{ width: aluguerPct + '%' }" />
          </div>
          <div class="flex items-center justify-between mt-3 text-sm">
            <span class="flex items-center gap-2 text-gray-600 dark:text-gray-300">
              <span class="w-2.5 h-2.5 rounded-full bg-brand-500" /> Venda ({{ vendaCount }})
            </span>
            <span class="flex items-center gap-2 text-gray-600 dark:text-gray-300">
              <span class="w-2.5 h-2.5 rounded-full bg-gray-300 dark:bg-gray-600" /> Aluguer ({{ aluguerCount }})
            </span>
          </div>
        </BaseCard>

        <div class="bg-gray-950 rounded-2xl p-4 text-white">
          <p class="text-sm font-semibold text-gray-300 mb-3">Ações Rápidas</p>
          <div class="flex flex-col gap-2">
            <BaseButton to="/backoffice/produtos/novo" variant="outline-light" class="text-center">+ Novo Produto</BaseButton>
            <BaseButton to="/backoffice/clientes/novo" variant="outline-light" class="text-center">+ Novo Cliente</BaseButton>
            <BaseButton to="/backoffice/manutencoes/novo" variant="outline-light" class="text-center">+ Nova Manutenção</BaseButton>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
