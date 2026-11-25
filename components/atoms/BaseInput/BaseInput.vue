<script setup lang="ts">
defineProps<{
  label?: string
  type?: string
  placeholder?: string
  required?: boolean
  step?: string
  multiline?: boolean
}>()

const [model, modifiers] = defineModel<string | number | null>({
  set(value) {
    if (!modifiers.number) return value
    return value === '' ? null : Number(value)
  },
})

const fieldClass =
  'w-full px-3.5 py-2.5 rounded-xl border border-line-strong bg-surface text-ink placeholder-subtle text-sm transition focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10'
</script>

<template>
  <div>
    <label v-if="label" class="text-sm font-medium text-ink-soft block mb-1.5">{{ label }}</label>
    <textarea
      v-if="multiline"
      v-model="model"
      :placeholder="placeholder"
      :required="required"
      rows="3"
      :class="fieldClass"
    />
    <input
      v-else
      v-model="model"
      :type="type || 'text'"
      :placeholder="placeholder"
      :required="required"
      :step="step"
      :class="fieldClass"
    />
  </div>
</template>
