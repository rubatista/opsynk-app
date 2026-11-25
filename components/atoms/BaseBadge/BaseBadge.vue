<script setup lang="ts">
withDefaults(
  defineProps<{
    variant?: 'venda' | 'aluguer' | 'neutral' | 'primary' | 'success' | 'warning' | 'danger' | 'info'
  }>(),
  { variant: 'neutral' }
)

const variants = {
  venda: 'bg-primary-soft text-primary-text',
  aluguer: 'bg-warning-soft text-warning',
  neutral: 'bg-surface-muted text-muted',
  primary: 'bg-primary-soft text-primary-text',
  success: 'bg-success-soft text-success',
  warning: 'bg-warning-soft text-warning',
  danger: 'bg-danger-soft text-danger',
  info: 'bg-info-soft text-info',
}
</script>

<template>
  <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold" :class="variants[variant]">
    <slot />
  </span>
</template>
