<script setup lang="ts">
import BaseCard from '~/components/atoms/BaseCard/BaseCard.vue'

definePageMeta({ layout: 'backoffice', title: 'Dashboard' })

const [products, users, maintenances] = await Promise.all([
  useAuthFetch<any[]>('/api/products'),
  useAuthFetch<any[]>('/api/users'),
  useAuthFetch<any[]>('/api/maintenances'),
])

const in30Days = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
const upcomingMaintenances = maintenances.filter((m) => m.nextDueDate && m.nextDueDate <= in30Days).length
</script>

<template>
  <div>
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl">
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
    </div>
  </div>
</template>
