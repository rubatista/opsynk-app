<script setup lang="ts">
withDefaults(
  defineProps<{
    to?: string
    type?: string
    variant?: 'primary' | 'secondary' | 'brand' | 'outline-light'
  }>(),
  { variant: 'primary', type: 'button' }
)

const variants = {
  primary: 'bg-indigo-600 text-white hover:bg-indigo-700',
  secondary: 'border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800',
  brand: 'bg-brand-500 text-white hover:bg-brand-600',
  'outline-light': 'border border-white/70 text-white hover:bg-white/10',
}
</script>

<template>
  <NuxtLink
    v-if="to"
    :to="to"
    class="inline-block px-4 py-2 rounded-xl text-sm font-semibold transition"
    :class="variants[variant]"
  >
    <slot />
  </NuxtLink>
  <button
    v-else
    :type="type"
    class="px-4 py-2 rounded-xl text-sm font-semibold transition"
    :class="variants[variant]"
  >
    <slot />
  </button>
</template>
