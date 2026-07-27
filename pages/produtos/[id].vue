<script setup lang="ts">
import ProductGallery from '~/components/sections/ProductGallery.vue'
import BaseBadge from '~/components/atoms/BaseBadge.vue'

const route = useRoute()
const { data: product } = await useFetch(`/api/products/${route.params.id}`)

const energyLabels: Record<string, string> = {
  eletrico: 'Elétrico',
  diesel: 'Diesel',
  gas: 'Gás',
}
</script>

<template>
  <div v-if="product" class="grid grid-cols-1 md:grid-cols-2 gap-8">
    <ProductGallery :images="product.images" />

    <div>
      <div class="flex items-start justify-between gap-2">
        <h1 class="text-2xl font-bold">{{ product.name }}</h1>
        <BaseBadge :variant="product.listingType">
          {{ product.listingType === 'aluguer' ? 'Aluguer' : 'Venda' }}
        </BaseBadge>
      </div>

      <p v-if="product.brand || product.model" class="text-gray-500 mt-1">
        {{ [product.brand, product.model].filter(Boolean).join(' ') }}
      </p>
      <p v-if="product.description" class="text-gray-600 mt-3">{{ product.description }}</p>

      <ul class="text-sm text-gray-500 mt-4 space-y-1">
        <li v-if="product.capacityKg">Capacidade: {{ product.capacityKg }} kg</li>
        <li v-if="product.energyType">Energia: {{ energyLabels[product.energyType] || product.energyType }}</li>
        <li v-if="product.year">Ano: {{ product.year }}</li>
      </ul>

      <div class="mt-6 flex items-center justify-between">
        <span class="text-2xl font-bold text-indigo-600">{{ product.price.toFixed(2) }} €</span>
        <span class="text-sm text-gray-400">Stock: {{ product.stock }}</span>
      </div>

      <NuxtLink to="/contactos" class="inline-block mt-6 bg-indigo-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-indigo-700">
        Falar Connosco
      </NuxtLink>
    </div>
  </div>

  <p v-else class="text-gray-500">Produto não encontrado.</p>
</template>
