<script setup lang="ts">
import BaseInput from '~/components/atoms/BaseInput/BaseInput.vue'
import BaseSelect from '~/components/atoms/BaseSelect/BaseSelect.vue'
import BaseButton from '~/components/atoms/BaseButton/BaseButton.vue'

definePageMeta({ layout: 'backoffice', title: 'Nova Manutenção' })

const route = useRoute()

const items = await useAuthFetch<any[]>('/api/equipment')
const equipmentOptions = items.map((item: any) => ({
  value: String(item.id),
  label: item.ownerName ? `${item.brand} ${item.model} — ${item.ownerName}` : `${item.brand} ${item.model}`,
}))

const equipmentId = ref(String(route.query.equipmentId || equipmentOptions[0]?.value || ''))
const performedAt = ref(new Date().toISOString().slice(0, 10))
const description = ref('')
const nextDueDate = ref('')
const nextDueNotes = ref('')
const error = ref('')

const { refreshNotifications } = useNotifications()

const submit = async () => {
  error.value = ''
  try {
    await useAuthFetch('/api/maintenances', {
      method: 'POST',
      body: {
        equipmentId: Number(equipmentId.value),
        performedAt: performedAt.value,
        description: description.value,
        nextDueDate: nextDueDate.value || null,
        nextDueNotes: nextDueNotes.value || null,
      },
    })
    refreshNotifications()
    navigateTo(`/backoffice/manutencoes/equipamento/${equipmentId.value}`)
  } catch (err: any) {
    error.value = err?.data?.statusMessage || 'Erro ao criar manutenção'
  }
}
</script>

<template>
  <div class="max-w-md">
    <h1 class="text-2xl font-bold mb-6 dark:text-white">Nova Manutenção</h1>

    <p v-if="!equipmentOptions.length" class="text-sm text-gray-500 dark:text-zinc-400 mb-4">
      Ainda não há equipamentos registados.
      <NuxtLink to="/backoffice/equipamentos/novo" class="text-brand-500 hover:underline">Criar um equipamento</NuxtLink>
      primeiro.
    </p>

    <form v-else class="space-y-4" @submit.prevent="submit">
      <BaseSelect v-model="equipmentId" label="Equipamento" :options="equipmentOptions" required />
      <BaseInput v-model="performedAt" label="Feita em" type="date" required />
      <BaseInput v-model="description" label="O que foi feito" multiline required />

      <div class="pt-2 border-t border-gray-100 dark:border-zinc-800">
        <p class="text-sm font-semibold mt-3 mb-3 dark:text-white">Próxima manutenção (opcional)</p>
        <BaseInput v-model="nextDueDate" label="Data" type="date" />
        <div class="mt-3">
          <BaseInput v-model="nextDueNotes" label="O que é preciso fazer" multiline />
        </div>
      </div>

      <p v-if="error" class="text-sm text-red-600 dark:text-red-400">{{ error }}</p>

      <div class="flex gap-3">
        <BaseButton type="submit" variant="brand">Guardar</BaseButton>
        <BaseButton to="/backoffice/manutencoes" variant="secondary">Cancelar</BaseButton>
      </div>
    </form>
  </div>
</template>
