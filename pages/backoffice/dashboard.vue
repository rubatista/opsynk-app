<script setup lang="ts">
import BaseCard from '~/components/atoms/BaseCard/BaseCard.vue'
import VisitsChart from '~/components/sections/VisitsChart/VisitsChart.vue'

definePageMeta({ layout: 'backoffice', title: 'Dashboard' })

const [products, users, maintenances, rentals, leads, clientTransactions] = await Promise.all([
  useAuthFetch<any[]>('/api/products'),
  useAuthFetch<any[]>('/api/users'),
  useAuthFetch<any[]>('/api/maintenances'),
  useAuthFetch<any[]>('/api/rentals'),
  useAuthFetch<any[]>('/api/leads'),
  useAuthFetch<any[]>('/api/client-transactions'),
])

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
</script>

<template>
  <div>
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 max-w-4xl">
      <BaseCard>
        <p class="text-sm text-gray-500 dark:text-gray-400">Produtos</p>
        <p class="text-3xl font-bold text-brand-500">{{ products.length }}</p>
      </BaseCard>
      <BaseCard>
        <p class="text-sm text-gray-500 dark:text-gray-400">Utilizadores</p>
        <p class="text-3xl font-bold text-brand-500">{{ users.length }}</p>
      </BaseCard>
      <NuxtLink to="/backoffice/manutencoes" class="block">
        <BaseCard class="h-full hover:shadow-md transition">
          <p class="text-sm text-gray-500 dark:text-gray-400">Manutenções em 30 dias</p>
          <p class="text-3xl font-bold text-brand-500">{{ upcomingMaintenances }}</p>
        </BaseCard>
      </NuxtLink>
      <NuxtLink to="/backoffice/alugueres" class="block">
        <BaseCard class="h-full hover:shadow-md transition">
          <p class="text-sm text-gray-500 dark:text-gray-400">Alugueres a terminar (30 dias)</p>
          <p class="text-3xl font-bold text-brand-500">{{ endingRentals }}</p>
        </BaseCard>
      </NuxtLink>
      <NuxtLink to="/backoffice/leads" class="block">
        <BaseCard class="h-full hover:shadow-md transition">
          <p class="text-sm text-gray-500 dark:text-gray-400">Novos pedidos de contacto</p>
          <p class="text-3xl font-bold text-brand-500">{{ newLeads }}</p>
        </BaseCard>
      </NuxtLink>
      <NuxtLink to="/backoffice/financeiro" class="block">
        <BaseCard class="h-full hover:shadow-md transition">
          <p class="text-sm text-gray-500 dark:text-gray-400">A receber de clientes</p>
          <p class="text-3xl font-bold text-brand-500">{{ pendingReceber.toFixed(2) }} €</p>
        </BaseCard>
      </NuxtLink>
      <NuxtLink to="/backoffice/financeiro" class="block">
        <BaseCard class="h-full hover:shadow-md transition">
          <p class="text-sm text-gray-500 dark:text-gray-400">A pagar a clientes</p>
          <p class="text-3xl font-bold text-brand-500">{{ pendingPagar.toFixed(2) }} €</p>
        </BaseCard>
      </NuxtLink>
    </div>

    <div class="max-w-4xl mt-6">
      <VisitsChart />
    </div>
  </div>
</template>
