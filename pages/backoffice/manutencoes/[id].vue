<script setup lang="ts">
import BaseInput from '~/components/atoms/BaseInput/BaseInput.vue'
import BaseButton from '~/components/atoms/BaseButton/BaseButton.vue'

definePageMeta({ layout: 'backoffice', title: 'Editar Manutenção' })

const route = useRoute()
const id = route.params.id as string

const maintenance = await useAuthFetch<any>(`/api/maintenances/${id}`)
const equipment = await useAuthFetch<any>(`/api/equipment/${maintenance.equipmentId}`)

const performedAt = ref(maintenance.performedAt)
const description = ref(maintenance.description)
const nextDueDate = ref(maintenance.nextDueDate || '')
const nextDueNotes = ref(maintenance.nextDueNotes || '')
const error = ref('')

const { refreshNotifications } = useNotifications()

const submit = async () => {
  error.value = ''
  try {
    await useAuthFetch(`/api/maintenances/${id}`, {
      method: 'PUT',
      body: {
        performedAt: performedAt.value,
        description: description.value,
        nextDueDate: nextDueDate.value || null,
        nextDueNotes: nextDueNotes.value || null,
      },
    })
    refreshNotifications()
    navigateTo(`/backoffice/manutencoes/equipamento/${equipment.id}`)
  } catch (err: any) {
    error.value = err?.data?.statusMessage || 'Erro ao guardar manutenção'
  }
}
</script>

<template>
  <div class="max-w-md">
    <h1 class="text-2xl font-bold mb-1 dark:text-white">Editar Manutenção</h1>
    <p class="text-sm text-gray-500 dark:text-zinc-400 mb-6">
      {{ equipment.brand }} {{ equipment.model }}
      <span v-if="equipment.ownerName"> — {{ equipment.ownerName }}</span>
    </p>

    <form class="space-y-4" @submit.prevent="submit">
      <BaseInput v-model="performedAt" label="Feita em" type="date" required />
      <BaseInput v-model="description" label="O que foi feito" multiline required />

      <div class="pt-2 border-t border-gray-100 dark:border-zinc-800">
        <p class="text-sm font-semibold mt-3 mb-3 dark:text-white">Próxima manutenção</p>
        <BaseInput v-model="nextDueDate" label="Data" type="date" />
        <div class="mt-3">
          <BaseInput v-model="nextDueNotes" label="O que é preciso fazer" multiline />
        </div>
      </div>

      <p v-if="error" class="text-sm text-red-600 dark:text-red-400">{{ error }}</p>

      <div class="flex gap-3">
        <BaseButton type="submit" variant="brand">Guardar</BaseButton>
        <BaseButton :to="`/backoffice/manutencoes/equipamento/${equipment.id}`" variant="secondary">Cancelar</BaseButton>
      </div>
    </form>
  </div>
</template>
