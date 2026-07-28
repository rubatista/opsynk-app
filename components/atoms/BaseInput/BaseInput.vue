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
</script>

<template>
  <div>
    <label v-if="label" class="text-sm block mb-1 dark:text-gray-300">{{ label }}</label>
    <textarea
      v-if="multiline"
      v-model="model"
      :placeholder="placeholder"
      :required="required"
      class="w-full p-2 border border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:placeholder-gray-500 rounded-lg text-sm"
    />
    <input
      v-else
      v-model="model"
      :type="type || 'text'"
      :placeholder="placeholder"
      :required="required"
      :step="step"
      class="w-full p-2 border border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:placeholder-gray-500 rounded-lg text-sm"
    />
  </div>
</template>
