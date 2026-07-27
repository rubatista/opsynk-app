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
    <label v-if="label" class="text-sm block mb-1">{{ label }}</label>
    <select
      v-model="model"
      :required="required"
      class="w-full p-2 border border-gray-300 rounded-lg text-sm bg-white"
    >
      <option v-for="opt in options" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
    </select>
  </div>
</template>
