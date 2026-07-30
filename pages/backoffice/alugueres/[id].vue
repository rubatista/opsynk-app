<script setup lang="ts">
import BaseInput from '~/components/atoms/BaseInput/BaseInput.vue'
import BaseSelect from '~/components/atoms/BaseSelect/BaseSelect.vue'
import BaseButton from '~/components/atoms/BaseButton/BaseButton.vue'

definePageMeta({ layout: 'backoffice', title: 'Editar Aluguer' })

const route = useRoute()
const id = route.params.id as string

const rental = await useAuthFetch<any>(`/api/rentals/${id}`)
const product = await useAuthFetch<any>(`/api/products/${rental.productId}`)

const clients = await useAuthFetch<any[]>('/api/clients')
const clientOptions = [
  { value: '', label: '— Nenhum / texto livre —' },
  ...clients.map((c: any) => ({ value: String(c.id), label: c.name })),
]

const statusOptions = [
  { value: 'ativo', label: 'Ativo' },
  { value: 'terminado', label: 'Terminado' },
]

const clientId = ref(rental.clientId ? String(rental.clientId) : '')
const renterName = ref(rental.renterName || '')
const renterContact = ref(rental.renterContact || '')
const startDate = ref(rental.startDate)
const endDate = ref(rental.endDate || '')
const status = ref(rental.status)
const notes = ref(rental.notes || '')
const error = ref('')

const submit = async () => {
  error.value = ''
  try {
    await useAuthFetch(`/api/rentals/${id}`, {
      method: 'PUT',
      body: {
        clientId: clientId.value || null,
        renterName: renterName.value || null,
        renterContact: renterContact.value || null,
        startDate: startDate.value,
        endDate: endDate.value || null,
        status: status.value,
        notes: notes.value || null,
      },
    })
    navigateTo('/backoffice/alugueres')
  } catch (err: any) {
    error.value = err?.data?.statusMessage || 'Erro ao guardar aluguer'
  }
}
</script>

<template>
  <div class="max-w-md">
    <h1 class="text-2xl font-bold mb-1 dark:text-white">Editar Aluguer</h1>
    <p class="text-sm text-gray-500 dark:text-gray-400 mb-6">{{ product.name }}</p>

    <form class="space-y-4" @submit.prevent="submit">
      <BaseSelect v-model="status" label="Estado" :options="statusOptions" />

      <BaseSelect v-model="clientId" label="Cliente registado (opcional)" :options="clientOptions" />
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <BaseInput v-model="renterName" label="Nome (se não tiver ficha de cliente)" />
        <BaseInput v-model="renterContact" label="Contacto" />
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <BaseInput v-model="startDate" label="Início" type="date" required />
        <BaseInput v-model="endDate" label="Fim previsto" type="date" />
      </div>
      <BaseInput v-model="notes" label="Notas" multiline />

      <p v-if="error" class="text-sm text-red-600 dark:text-red-400">{{ error }}</p>

      <div class="flex gap-3">
        <BaseButton type="submit" variant="brand">Guardar</BaseButton>
        <BaseButton to="/backoffice/alugueres" variant="secondary">Cancelar</BaseButton>
      </div>
    </form>
  </div>
</template>
