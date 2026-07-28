<script setup lang="ts">
import BaseInput from '~/components/atoms/BaseInput/BaseInput.vue'
import BaseButton from '~/components/atoms/BaseButton/BaseButton.vue'

definePageMeta({ layout: 'backoffice', title: 'Editar Manutenção' })

const route = useRoute()
const id = route.params.id as string

const maintenance = await useAuthFetch<any>(`/api/maintenances/${id}`)
const product = await useAuthFetch<any>(`/api/products/${maintenance.productId}`)

const performedAt = ref(maintenance.performedAt)
const description = ref(maintenance.description)
const nextDueDate = ref(maintenance.nextDueDate || '')
const error = ref('')

const submit = async () => {
  error.value = ''
  try {
    await useAuthFetch(`/api/maintenances/${id}`, {
      method: 'PUT',
      body: {
        performedAt: performedAt.value,
        description: description.value,
        nextDueDate: nextDueDate.value || null,
      },
    })
    navigateTo('/backoffice/manutencoes')
  } catch (err: any) {
    error.value = err?.data?.statusMessage || 'Erro ao guardar manutenção'
  }
}
</script>

<template>
  <div class="max-w-md">
    <h1 class="text-2xl font-bold mb-1 dark:text-white">Editar Manutenção</h1>
    <p class="text-sm text-gray-500 dark:text-gray-400 mb-6">{{ product.name }}</p>

    <form class="space-y-4" @submit.prevent="submit">
      <div class="grid grid-cols-2 gap-4">
        <BaseInput v-model="performedAt" label="Feita em" type="date" required />
        <BaseInput v-model="nextDueDate" label="Próxima data" type="date" />
      </div>
      <BaseInput v-model="description" label="O que foi feito" multiline required />

      <p v-if="error" class="text-sm text-red-600 dark:text-red-400">{{ error }}</p>

      <div class="flex gap-3">
        <BaseButton type="submit" variant="brand">Guardar</BaseButton>
        <BaseButton to="/backoffice/manutencoes" variant="secondary">Cancelar</BaseButton>
      </div>
    </form>
  </div>
</template>
