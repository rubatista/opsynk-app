<script setup lang="ts">
const categories = [
  {
    id: 'combustao',
    label: 'Combustão Interna',
    items: [
      {
        name: 'Série A 1.0-3.8t',
        subtitle: 'Empilhador contrabalançado a combustão interna',
        features: ['Robusto e fiável', 'Fácil manutenção', 'Baixo custo de operação'],
      },
      {
        name: 'Série X 4.0-7.0t',
        subtitle: 'Empilhador de grande capacidade',
        features: ['Alta capacidade de carga', 'Motor diesel/gás', 'Uso intensivo'],
      },
    ],
  },
  {
    id: 'eletricos',
    label: 'Elétricos',
    items: [
      {
        name: 'Série E 1.0-3.0t',
        subtitle: 'Empilhador contrabalançado elétrico',
        features: ['Zero emissões', 'Baixo ruído', 'Ideal para interiores'],
      },
    ],
  },
  {
    id: 'armazem',
    label: 'Armazém',
    items: [
      {
        name: 'Porta-Paletes Elétrico',
        subtitle: 'Equipamento de armazém para movimentação de paletes',
        features: ['Compacto', 'Fácil de manobrar', 'Bateria de longa duração'],
      },
    ],
  },
]

const activeCategory = ref(0)
const activeItem = ref(0)

const currentItems = computed(() => categories[activeCategory.value].items)

const selectCategory = (index: number) => {
  activeCategory.value = index
  activeItem.value = 0
}

const next = () => {
  activeItem.value = (activeItem.value + 1) % currentItems.value.length
}
const prev = () => {
  activeItem.value = (activeItem.value - 1 + currentItems.value.length) % currentItems.value.length
}
</script>

<template>
  <section class="relative bg-white py-20 overflow-hidden">
    <div
      class="absolute top-0 right-0 h-24 w-40 bg-brand-500"
      style="clip-path: polygon(30% 0, 100% 0, 100% 100%)"
    />

    <div class="max-w-6xl mx-auto px-6">
      <h2 class="text-3xl font-black tracking-tight text-center mb-8">OS NOSSOS PRODUTOS</h2>

      <div class="flex flex-wrap justify-center gap-6 border-b border-gray-200 mb-10 text-sm font-semibold">
        <button
          v-for="(category, index) in categories"
          :key="category.id"
          class="pb-3 border-b-2 transition"
          :class="index === activeCategory ? 'border-brand-500 text-brand-500' : 'border-transparent text-gray-500 hover:text-gray-800'"
          @click="selectCategory(index)"
        >
          {{ category.label }}
        </button>
      </div>

      <div class="flex items-center gap-4">
        <button
          class="hidden sm:flex shrink-0 w-10 h-10 rounded-full border border-gray-300 items-center justify-center hover:bg-gray-50 transition"
          @click="prev"
        >
          ‹
        </button>

        <div class="flex-1 grid grid-cols-1 md:grid-cols-2 gap-8 items-center bg-gray-50 rounded-xl p-8">
          <div>
            <h3 class="text-xl font-bold mb-2">{{ currentItems[activeItem].name }}</h3>
            <p class="text-gray-500 mb-4">{{ currentItems[activeItem].subtitle }}</p>
            <ul class="text-sm text-gray-600 space-y-1">
              <li v-for="feature in currentItems[activeItem].features" :key="feature">// {{ feature }}</li>
            </ul>
          </div>

          <div class="aspect-video bg-white border border-gray-200 rounded-lg flex items-center justify-center text-gray-400 text-sm">
            Imagem do empilhador
          </div>
        </div>

        <button
          class="hidden sm:flex shrink-0 w-10 h-10 rounded-full border border-gray-300 items-center justify-center hover:bg-gray-50 transition"
          @click="next"
        >
          ›
        </button>
      </div>
    </div>
  </section>
</template>
