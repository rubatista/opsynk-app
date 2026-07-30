<script setup lang="ts">
import BaseCard from '~/components/atoms/BaseCard/BaseCard.vue'

definePageMeta({ layout: 'backoffice', title: 'Dashboard' })

const [products, users, maintenances, rentals] = await Promise.all([
  useAuthFetch<any[]>('/api/products'),
  useAuthFetch<any[]>('/api/users'),
  useAuthFetch<any[]>('/api/maintenances'),
  useAuthFetch<any[]>('/api/rentals'),
])

const in30Days = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
const upcomingMaintenances = maintenances.filter((m) => m.nextDueDate && m.nextDueDate <= in30Days).length
const endingRentals = rentals.filter((r) => r.status === 'ativo' && r.endDate && r.endDate <= in30Days).length
</script>

<template>
  <div>
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-3xl">
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
    </div>
  </div>
</template>
