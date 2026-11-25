<script setup lang="ts">
defineProps<{
  label?: string
  options: { value: string; label: string }[]
  required?: boolean
}>()

const model = defineModel<string>()
</script>

<template>
  <div>
    <label v-if="label" class="text-sm font-medium text-ink-soft block mb-1.5">{{ label }}</label>
    <select
      v-model="model"
      :required="required"
      class="w-full px-3.5 py-2.5 rounded-xl border border-line-strong bg-surface text-ink text-sm transition focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10"
    >
      <option v-for="opt in options" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
    </select>
  </div>
</template>
