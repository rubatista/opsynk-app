<script setup lang="ts">
import ProductGallery from '~/components/sections/ProductGallery/ProductGallery.vue'
import BaseButton from '~/components/atoms/BaseButton/BaseButton.vue'

definePageMeta({ layout: 'landing' })

const route = useRoute()
const { data: product } = await useFetch(`/api/products/${route.params.id}`)

const energyLabels: Record<string, string> = {
  eletrico: 'Elétrico',
  diesel: 'Diesel',
  gas: 'Gás',
}

if (product.value) {
  useSeoMeta({
    title: product.value.metaTitle || product.value.name,
    description: product.value.metaDescription || product.value.description || undefined,
    ogImage: product.value.images?.[0]?.url,
  })
}
</script>

<template>
  <div class="bg-white">
    <div v-if="product" class="max-w-6xl mx-auto px-6 py-12">
      <NuxtLink to="/produtos" class="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-brand-500 transition mb-8">
        ‹ Voltar aos produtos
      </NuxtLink>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-10">
        <ProductGallery :images="product.images" />

        <div>
          <span
            class="inline-block px-2.5 py-1 rounded-full text-xs font-semibold mb-3"
            :class="product.listingType === 'aluguer' ? 'bg-brand-500 text-white' : 'bg-gray-900 text-white'"
          >
            {{ product.listingType === 'aluguer' ? 'Aluguer' : 'Venda' }}
          </span>

          <h1 class="text-3xl font-black tracking-tight">{{ product.name }}</h1>

          <p v-if="product.brand || product.model" class="text-gray-500 mt-1">
            {{ [product.brand, product.model].filter(Boolean).join(' ') }}
          </p>
          <p v-if="product.description" class="text-gray-600 mt-4">{{ product.description }}</p>

          <ul class="text-sm text-gray-600 mt-6 space-y-2 border-t border-gray-100 pt-6">
            <li v-if="product.capacityKg" class="flex justify-between">
              <span class="text-gray-400">Capacidade</span><span>{{ product.capacityKg }} kg</span>
            </li>
            <li v-if="product.energyType" class="flex justify-between">
              <span class="text-gray-400">Energia</span><span>{{ energyLabels[product.energyType] || product.energyType }}</span>
            </li>
            <li v-if="product.year" class="flex justify-between">
              <span class="text-gray-400">Ano</span><span>{{ product.year }}</span>
            </li>
          </ul>

          <div class="mt-6 flex items-center justify-between border-t border-gray-100 pt-6">
            <span class="text-3xl font-black text-brand-500">{{ product.price.toFixed(2) }} €</span>
            <span class="text-sm text-gray-400">Stock: {{ product.stock }}</span>
          </div>

          <div class="mt-8 flex gap-3">
            <BaseButton to="/contactos" variant="brand">Falar Connosco</BaseButton>
            <BaseButton to="/produtos" variant="secondary">Ver Mais Produtos</BaseButton>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="max-w-6xl mx-auto px-6 py-12">
      <p class="text-gray-500">Produto não encontrado.</p>
    </div>
  </div>
</template>
