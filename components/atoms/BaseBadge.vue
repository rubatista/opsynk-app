<script setup lang="ts">
withDefaults(
  defineProps<{
    variant?: 'venda' | 'aluguer' | 'neutral'
  }>(),
  { variant: 'neutral' }
)

const variants = {
  venda: 'bg-indigo-100 text-indigo-700',
  aluguer: 'bg-amber-100 text-amber-700',
  neutral: 'bg-gray-100 text-gray-700',
}
</script>

<template>
  <span class="inline-block px-2 py-0.5 rounded-full text-xs font-semibold" :class="variants[variant]">
    <slot />
  </span>
</template>
