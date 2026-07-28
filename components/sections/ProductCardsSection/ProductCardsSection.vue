<script setup lang="ts">
import BaseCard from '~/components/atoms/BaseCard/BaseCard.vue'

const products = [
  { id: 1, name: 'Empilhador Elétrico Compacto' },
  { id: 2, name: 'Porta-Paletes Elétrico' },
  { id: 3, name: 'Série R 1.0-3.0t' },
]
</script>

<template>
  <section class="bg-gray-50 py-20">
    <div class="max-w-6xl mx-auto px-6">
      <div class="flex items-end justify-between mb-8">
        <h2 class="text-3xl font-black tracking-tight">NOVIDADES</h2>
        <NuxtLink to="/produtos" class="text-sm font-semibold text-brand-500 hover:text-brand-600 transition">
          Ver Todos
        </NuxtLink>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <BaseCard v-for="product in products" :key="product.id" class="text-center">
          <div class="aspect-square bg-gray-100 rounded-lg mb-4 flex items-center justify-center text-gray-400 text-xs">
            Imagem
          </div>
          <h3 class="font-semibold text-sm">{{ product.name }}</h3>
        </BaseCard>
      </div>
    </div>
  </section>
</template>
