<script setup lang="ts">
withDefaults(
  defineProps<{
    to?: string
    type?: string
    variant?: 'primary' | 'secondary'
  }>(),
  { variant: 'primary', type: 'button' }
)

const variants = {
  primary: 'bg-indigo-600 text-white hover:bg-indigo-700',
  secondary: 'border border-gray-300 text-gray-700 hover:bg-gray-50',
}
</script>

<template>
  <NuxtLink
    v-if="to"
    :to="to"
    class="inline-block px-4 py-2 rounded-lg text-sm font-semibold transition"
    :class="variants[variant]"
  >
    <slot />
  </NuxtLink>
  <button
    v-else
    :type="type"
    class="px-4 py-2 rounded-lg text-sm font-semibold transition"
    :class="variants[variant]"
  >
    <slot />
  </button>
</template>
