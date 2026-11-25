<script setup lang="ts">
withDefaults(
  defineProps<{
    to?: string
    type?: string
    // `primary` and `brand` both use the themed primary color (violet in the backoffice, the company red on the public site).
    variant?: 'primary' | 'brand' | 'secondary' | 'soft' | 'outline-light'
  }>(),
  { variant: 'primary', type: 'button' }
)

const base =
  'px-4 py-2.5 rounded-xl text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/25 disabled:opacity-60 disabled:cursor-not-allowed'

const variants = {
  primary: 'bg-primary text-white hover:bg-primary-hover shadow-sm shadow-primary/25',
  brand: 'bg-primary text-white hover:bg-primary-hover shadow-sm shadow-primary/25',
  secondary: 'border border-line-strong bg-surface text-ink-soft hover:bg-surface-muted hover:text-ink',
  soft: 'bg-primary-soft text-primary-text hover:bg-primary/15',
  'outline-light': 'border border-white/70 text-white hover:bg-white/10',
}
</script>

<template>
  <NuxtLink v-if="to" :to="to" class="inline-block" :class="[base, variants[variant]]">
    <slot />
  </NuxtLink>
  <button v-else :type="type" :class="[base, variants[variant]]">
    <slot />
  </button>
</template>
