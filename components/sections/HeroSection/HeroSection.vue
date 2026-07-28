<script setup lang="ts">
import BaseButton from '~/components/atoms/BaseButton/BaseButton.vue'

const slides = [
  {
    id: 1,
    kicker: 'Venda · Aluguer · Manutenção',
    title: ['SIMPLES', 'SÓLIDO', 'SEGURO'],
    subtitle: 'Empilhadores a diesel, gás e elétricos para qualquer operação.',
  },
  {
    id: 2,
    kicker: 'Frota pronta a trabalhar',
    title: ['STOCK', 'DISPONÍVEL', 'JÁ'],
    subtitle: 'Equipamento revisto e pronto a entregar, com ou sem aluguer.',
  },
  {
    id: 3,
    kicker: 'Assistência técnica',
    title: ['PEÇAS', 'E', 'SUPORTE'],
    subtitle: 'Manutenção e peças originais para manter a sua frota operacional.',
  },
]

const activeIndex = ref(0)

const next = () => {
  activeIndex.value = (activeIndex.value + 1) % slides.length
}
const prev = () => {
  activeIndex.value = (activeIndex.value - 1 + slides.length) % slides.length
}
</script>

<template>
  <section class="relative bg-gray-950 text-white overflow-hidden">
    <div
      class="absolute inset-y-0 right-0 w-2/3 bg-brand-500/10"
      style="clip-path: polygon(30% 0, 100% 0, 100% 100%, 0 100%)"
    />

    <div class="relative max-w-6xl mx-auto px-6 py-20 grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
      <div>
        <p class="text-brand-400 text-sm font-semibold tracking-wide uppercase mb-3">
          {{ slides[activeIndex].kicker }}
        </p>
        <h1 class="text-5xl sm:text-6xl font-black leading-[0.95] tracking-tight mb-6">
          <span v-for="line in slides[activeIndex].title" :key="line" class="block">{{ line }}</span>
        </h1>
        <p class="text-gray-300 max-w-md mb-8">
          {{ slides[activeIndex].subtitle }}
        </p>
        <div class="flex gap-3">
          <BaseButton to="/produtos" variant="brand">Ver Empilhadores</BaseButton>
          <BaseButton to="/contactos" variant="outline-light">Fale Connosco</BaseButton>
        </div>
      </div>

      <div class="aspect-[4/3] bg-white/5 border border-white/10 rounded-xl flex items-center justify-center text-gray-500 text-sm">
        Imagem do empilhador
      </div>
    </div>

    <div class="relative flex items-center justify-center gap-4 pb-8">
      <button
        class="w-9 h-9 rounded-full border border-white/30 flex items-center justify-center hover:bg-white/10 transition"
        @click="prev"
      >
        ‹
      </button>
      <div class="flex gap-2">
        <button
          v-for="(slide, index) in slides"
          :key="slide.id"
          class="w-2.5 h-2.5 rounded-full transition"
          :class="index === activeIndex ? 'bg-brand-500' : 'bg-white/30'"
          @click="activeIndex = index"
        />
      </div>
      <button
        class="w-9 h-9 rounded-full border border-white/30 flex items-center justify-center hover:bg-white/10 transition"
        @click="next"
      >
        ›
      </button>
    </div>
  </section>
</template>
