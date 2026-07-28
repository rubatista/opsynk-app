<script setup lang="ts">
const points = [
  {
    title: 'Um único parceiro para toda a operação',
    description:
      'Venda, aluguer, manutenção e peças num só lugar, para não perder tempo a gerir vários fornecedores.',
  },
  {
    title: 'Frota diversificada e disponível',
    description:
      'Empilhadores a diesel, gás e elétricos, de várias capacidades, prontos a entregar ou alugar.',
  },
  {
    title: 'Assistência técnica próxima',
    description:
      'Equipa técnica para manutenção preventiva e reparação, para manter a sua frota sempre operacional.',
  },
]
</script>

<template>
  <section id="sobre-nos" class="relative bg-white py-20 overflow-hidden scroll-mt-20">
    <div
      class="absolute inset-y-0 left-0 w-1/2 bg-brand-50"
      style="clip-path: polygon(0 0, 85% 0, 65% 100%, 0 100%)"
    />

    <div class="relative max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
      <div class="aspect-[4/3] bg-gray-100 border border-gray-200 rounded-xl flex items-center justify-center text-gray-400 text-sm">
        Imagem da equipa/armazém
      </div>

      <div>
        <h2 class="text-3xl font-black tracking-tight mb-8">SOBRE NÓS</h2>

        <div class="space-y-6">
          <div v-for="(point, index) in points" :key="point.title" class="flex gap-4">
            <span class="shrink-0 w-8 h-8 rounded-full bg-brand-500 text-white font-bold flex items-center justify-center text-sm">
              {{ index + 1 }}
            </span>
            <div>
              <h3 class="font-semibold mb-1">{{ point.title }}</h3>
              <p class="text-sm text-gray-500">{{ point.description }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
