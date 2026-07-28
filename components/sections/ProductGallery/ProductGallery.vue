<script setup lang="ts">
const props = defineProps<{
  images: { id: number; url: string }[]
}>()

const activeIndex = ref(0)

const next = () => {
  activeIndex.value = (activeIndex.value + 1) % props.images.length
}
const prev = () => {
  activeIndex.value = (activeIndex.value - 1 + props.images.length) % props.images.length
}
</script>

<template>
  <div v-if="images.length" class="space-y-3">
    <div class="relative aspect-video bg-gray-100 rounded-xl overflow-hidden">
      <img :src="images[activeIndex].url" class="w-full h-full object-cover" />

      <template v-if="images.length > 1">
        <button
          class="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 rounded-full w-8 h-8 flex items-center justify-center hover:bg-white"
          @click="prev"
        >
          ‹
        </button>
        <button
          class="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 rounded-full w-8 h-8 flex items-center justify-center hover:bg-white"
          @click="next"
        >
          ›
        </button>
      </template>
    </div>

    <div v-if="images.length > 1" class="flex justify-center gap-2">
      <button
        v-for="(image, index) in images"
        :key="image.id"
        class="w-2.5 h-2.5 rounded-full"
        :class="index === activeIndex ? 'bg-brand-500' : 'bg-gray-300'"
        @click="activeIndex = index"
      />
    </div>
  </div>

  <div v-else class="aspect-video bg-gray-100 rounded-xl flex items-center justify-center text-gray-400 text-sm">
    Sem imagens disponíveis
  </div>
</template>
