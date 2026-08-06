<script setup lang="ts">
import BaseCard from '~/components/atoms/BaseCard/BaseCard.vue'

definePageMeta({ layout: 'landing' })

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
    <section class="relative bg-gray-950 text-white overflow-hidden">
      <div
        class="absolute inset-y-0 right-0 w-1/2 bg-brand-500/10"
        style="clip-path: polygon(30% 0, 100% 0, 100% 100%, 0 100%)"
      />

      <div class="relative max-w-6xl mx-auto px-6 py-16">
        <h1 class="text-4xl font-black tracking-tight mb-3">OS NOSSOS EMPILHADORES</h1>
        <p class="text-gray-300 max-w-lg mb-8">
          Venda e aluguer de empilhadores prontos a trabalhar, com assistência técnica incluída.
        </p>

        <div class="flex gap-2">
          <button
            v-for="option in filterOptions"
            :key="option.value"
            class="px-4 py-1.5 rounded-full text-sm font-semibold border transition"
            :class="filter === option.value ? 'bg-brand-500 border-brand-500 text-white' : 'border-white/30 text-gray-300 hover:bg-white/10'"
            @click="filter = option.value"
          >
            {{ option.label }}
          </button>
        </div>
      </div>
    </section>

    <section class="bg-white py-16">
      <div class="max-w-6xl mx-auto px-6">
        <p v-if="pending" class="text-gray-500">A carregar...</p>
        <p v-else-if="!filtered.length" class="text-gray-500">Ainda não há empilhadores nesta categoria.</p>

        <div v-else class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          <NuxtLink v-for="product in filtered" :key="product.id" :to="`/produtos/${product.id}`" class="block group">
            <BaseCard class="h-full transition group-hover:shadow-lg group-hover:-translate-y-0.5">
              <div class="aspect-video bg-gray-100 rounded-lg overflow-hidden mb-3 relative">
                <img
                  v-if="product.images?.[0]"
                  :src="product.images[0].url"
                  class="w-full h-full object-cover"
                />
                <div v-else class="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                  Sem imagem
                </div>
                <span
                  class="absolute top-2 left-2 px-2.5 py-1 rounded-full text-xs font-semibold"
                  :class="product.listingType === 'aluguer' ? 'bg-brand-500 text-white' : 'bg-gray-900 text-white'"
                >
                  {{ product.listingType === 'aluguer' ? 'Aluguer' : 'Venda' }}
                </span>
              </div>

              <h2 class="font-semibold text-lg">{{ product.name }}</h2>

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
                <span class="font-bold text-brand-500">{{ formatCurrency(product.price) }}</span>
                <span class="text-xs text-gray-400">Stock: {{ product.stock }}</span>
              </div>
            </BaseCard>
          </NuxtLink>
        </div>
      </div>
    </section>
  </div>
</template>
