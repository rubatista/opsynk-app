<script setup lang="ts">
import BaseCard from '~/components/atoms/BaseCard.vue'

definePageMeta({ layout: 'backoffice' })

const [products, users] = await Promise.all([
  useAuthFetch<any[]>('/api/products'),
  useAuthFetch<any[]>('/api/users'),
])
</script>

<template>
  <div>
    <h1 class="text-2xl font-bold mb-6">Dashboard</h1>

    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg">
      <BaseCard>
        <p class="text-sm text-gray-500">Produtos</p>
        <p class="text-3xl font-bold">{{ products.length }}</p>
      </BaseCard>
      <BaseCard>
        <p class="text-sm text-gray-500">Utilizadores</p>
        <p class="text-3xl font-bold">{{ users.length }}</p>
      </BaseCard>
    </div>
  </div>
</template>
