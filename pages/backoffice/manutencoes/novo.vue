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
const error = ref('')

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
      },
    })
    navigateTo('/backoffice/manutencoes')
  } catch (err: any) {
    error.value = err?.data?.statusMessage || 'Erro ao criar manutenção'
  }
}
</script>

<template>
  <div class="max-w-md">
    <h1 class="text-2xl font-bold mb-6 dark:text-white">Nova Manutenção</h1>

    <p v-if="!equipmentOptions.length" class="text-sm text-gray-500 dark:text-gray-400 mb-4">
      Ainda não há equipamentos registados.
      <NuxtLink to="/backoffice/equipamentos/novo" class="text-brand-500 hover:underline">Criar um equipamento</NuxtLink>
      primeiro.
    </p>

    <form v-else class="space-y-4" @submit.prevent="submit">
      <BaseSelect v-model="equipmentId" label="Equipamento" :options="equipmentOptions" required />
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
