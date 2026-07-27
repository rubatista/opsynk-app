<script setup lang="ts">
import BaseCard from '~/components/atoms/BaseCard.vue'
import BaseBadge from '~/components/atoms/BaseBadge.vue'

const { data: products, pending } = await useFetch('/api/products')

const filter = ref<'todos' | 'venda' | 'aluguer'>('todos')
const filterOptions = [
  { value: 'todos', label: 'Todos' },
  { value: 'venda', label: 'Venda' },
  { value: 'aluguer', label: 'Aluguer' },
] as const

const filtered = computed(() => {
  if (!products.value) return []
  if (filter.value === 'todos') return products.value
  return products.value.filter((p: any) => p.listingType === filter.value)
})

const energyLabels: Record<string, string> = {
  eletrico: 'Elétrico',
  diesel: 'Diesel',
  gas: 'Gás',
}
</script>

<template>
  <div>
    <h1 class="text-2xl font-bold mb-6">Empilhadores</h1>

    <div class="flex gap-2 mb-6">
      <button
        v-for="option in filterOptions"
        :key="option.value"
        class="px-3 py-1.5 rounded-full text-sm border transition"
        :class="filter === option.value ? 'bg-indigo-600 text-white border-indigo-600' : 'border-gray-300 text-gray-600 hover:bg-gray-50'"
        @click="filter = option.value"
      >
        {{ option.label }}
      </button>
    </div>

    <p v-if="pending" class="text-gray-500">A carregar...</p>
    <p v-else-if="!filtered.length" class="text-gray-500">Ainda não há empilhadores nesta categoria.</p>

    <div v-else class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
      <NuxtLink v-for="product in filtered" :key="product.id" :to="`/produtos/${product.id}`" class="block">
        <BaseCard>
          <div class="aspect-video bg-gray-100 rounded-lg overflow-hidden mb-3">
            <img
              v-if="product.images?.[0]"
              :src="product.images[0].url"
              class="w-full h-full object-cover"
            />
            <div v-else class="w-full h-full flex items-center justify-center text-gray-400 text-xs">
              Sem imagem
            </div>
          </div>

          <div class="flex items-start justify-between gap-2">
            <h2 class="font-semibold text-lg">{{ product.name }}</h2>
            <BaseBadge :variant="product.listingType">
              {{ product.listingType === 'aluguer' ? 'Aluguer' : 'Venda' }}
            </BaseBadge>
          </div>

          <p v-if="product.brand || product.model" class="text-sm text-gray-500 mt-1">
            {{ [product.brand, product.model].filter(Boolean).join(' ') }}
          </p>
          <p v-if="product.description" class="text-sm text-gray-500 mt-1">{{ product.description }}</p>

          <ul class="text-xs text-gray-500 mt-3 space-y-1">
            <li v-if="product.capacityKg">Capacidade: {{ product.capacityKg }} kg</li>
            <li v-if="product.energyType">Energia: {{ energyLabels[product.energyType] || product.energyType }}</li>
            <li v-if="product.year">Ano: {{ product.year }}</li>
          </ul>

          <div class="mt-3 flex items-center justify-between">
            <span class="font-bold text-indigo-600">{{ product.price.toFixed(2) }} €</span>
            <span class="text-xs text-gray-400">Stock: {{ product.stock }}</span>
          </div>
        </BaseCard>
      </NuxtLink>
    </div>
  </div>
</template>
