<script setup lang="ts">
import BaseCard from '~/components/atoms/BaseCard/BaseCard.vue'

const servicos = [
  {
    title: 'Venda',
    description: 'Empilhadores novos e usados, de várias marcas e capacidades, prontos para a sua operação.',
  },
  {
    title: 'Aluguer',
    description: 'Soluções de aluguer de curta e longa duração, com opções elétricas, a diesel ou a gás.',
  },
  {
    title: 'Manutenção e Peças',
    description: 'Assistência técnica e peças originais para manter a sua frota sempre operacional.',
  },
]
</script>

<template>
  <section class="py-10">
    <h2 class="text-2xl font-bold mb-6 text-center">Os Nossos Serviços</h2>
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <BaseCard v-for="servico in servicos" :key="servico.title">
        <h3 class="font-semibold text-lg mb-2">{{ servico.title }}</h3>
        <p class="text-sm text-gray-500">{{ servico.description }}</p>
      </BaseCard>
    </div>
  </section>
</template>
