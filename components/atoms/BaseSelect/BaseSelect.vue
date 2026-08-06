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
    <label v-if="label" class="text-sm block mb-1 dark:text-gray-300">{{ label }}</label>
    <select
      v-model="model"
      :required="required"
      class="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-xl text-sm bg-white dark:bg-gray-900 dark:text-gray-100"
    >
      <option v-for="opt in options" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
    </select>
  </div>
</template>
