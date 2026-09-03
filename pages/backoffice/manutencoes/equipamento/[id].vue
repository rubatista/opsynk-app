<script setup lang="ts">
import BaseButton from '~/components/atoms/BaseButton/BaseButton.vue'
import BaseCard from '~/components/atoms/BaseCard/BaseCard.vue'
import BaseInput from '~/components/atoms/BaseInput/BaseInput.vue'

definePageMeta({ layout: 'backoffice', title: 'Histórico de Manutenções' })

const route = useRoute()
const id = route.params.id as string

const equipmentList = await useAuthFetch<any[]>('/api/equipment')
const equipment = equipmentList.find((item: any) => item.id === Number(id))

if (!equipment) {
  throw createError({ statusCode: 404, statusMessage: 'Equipamento não encontrado' })
}

const maintenances = ref(await useAuthFetch<any[]>(`/api/maintenances?equipmentId=${id}`))
const history = computed(() => [...maintenances.value].sort((a, b) => b.performedAt.localeCompare(a.performedAt)))

const nextMaintenance = computed(() => {
  const withDueDate = maintenances.value.filter((m) => m.nextDueDate)
  if (!withDueDate.length) return null
  return [...withDueDate].sort((a, b) => a.nextDueDate.localeCompare(b.nextDueDate))[0]
})

const today = new Date().toISOString().slice(0, 10)
const isOverdue = (date: string | null) => !!date && date < today

const editingNext = ref(false)
const nextDate = ref('')
const nextNotes = ref('')
const nextError = ref('')

const startEditNext = () => {
  nextDate.value = nextMaintenance.value?.nextDueDate || ''
  nextNotes.value = nextMaintenance.value?.nextDueNotes || ''
  nextError.value = ''
  editingNext.value = true
}

const { refreshNotifications } = useNotifications()

const saveNext = async () => {
  if (!nextMaintenance.value) return
  nextError.value = ''
  try {
    const updated = await useAuthFetch<any>(`/api/maintenances/${nextMaintenance.value.id}`, {
      method: 'PUT',
      body: {
        nextDueDate: nextDate.value || null,
        nextDueNotes: nextNotes.value || null,
      },
    })
    maintenances.value = maintenances.value.map((m) => (m.id === updated.id ? updated : m))
    editingNext.value = false
    refreshNotifications()
  } catch (err: any) {
    nextError.value = err?.data?.statusMessage || 'Erro ao guardar'
  }
}

const removeMaintenance = async (maintenanceId: number) => {
  if (!confirm('Apagar esta manutenção?')) return
  await useAuthFetch(`/api/maintenances/${maintenanceId}`, { method: 'DELETE' })
  maintenances.value = maintenances.value.filter((m) => m.id !== maintenanceId)
  refreshNotifications()
}
</script>

<template>
  <div class="max-w-3xl">
    <div class="flex items-center justify-between mb-2">
      <h1 class="text-2xl font-bold dark:text-white">{{ equipment.brand }} {{ equipment.model }}</h1>
      <div class="flex gap-3">
        <BaseButton :to="`/backoffice/manutencoes/novo?equipmentId=${id}`" variant="brand">+ Nova Manutenção</BaseButton>
        <BaseButton to="/backoffice/manutencoes" variant="secondary">Voltar</BaseButton>
      </div>
    </div>

    <p class="text-sm text-gray-500 dark:text-zinc-400 mb-6">
      <NuxtLink v-if="equipment.client" :to="`/backoffice/clientes/${equipment.client.id}`" class="text-brand-500 hover:underline">
        {{ equipment.client.name }}
      </NuxtLink>
      <span v-else-if="equipment.ownerName">{{ equipment.ownerName }}</span>
      <span v-else>Stock próprio</span>
      <span v-if="equipment.serialNumber"> — Nº série {{ equipment.serialNumber }}</span>
    </p>

    <BaseCard class="mb-6">
      <div class="flex items-center justify-between mb-1">
        <p class="text-xs text-gray-500 dark:text-zinc-400">Próxima manutenção</p>
        <button
          v-if="nextMaintenance && !editingNext"
          class="text-xs text-brand-500 hover:underline"
          @click="startEditNext"
        >
          Editar
        </button>
      </div>

      <template v-if="editingNext">
        <div class="space-y-3 mt-2">
          <BaseInput v-model="nextDate" label="Data" type="date" />
          <BaseInput v-model="nextNotes" label="O que é preciso fazer" multiline />
          <p v-if="nextError" class="text-sm text-red-600 dark:text-red-400">{{ nextError }}</p>
          <div class="flex gap-3">
            <BaseButton variant="brand" @click="saveNext">Guardar</BaseButton>
            <BaseButton variant="secondary" @click="editingNext = false">Cancelar</BaseButton>
          </div>
        </div>
      </template>
      <template v-else-if="nextMaintenance">
        <p
          class="text-xl font-bold"
          :class="isOverdue(nextMaintenance.nextDueDate) ? 'text-red-600 dark:text-red-400' : 'text-brand-500'"
        >
          {{ nextMaintenance.nextDueDate }}
          <span v-if="isOverdue(nextMaintenance.nextDueDate)" class="text-sm font-semibold">(em atraso)</span>
        </p>
        <p v-if="nextMaintenance.nextDueNotes" class="text-sm text-gray-600 dark:text-zinc-300 mt-1">
          {{ nextMaintenance.nextDueNotes }}
        </p>
        <NuxtLink
          :to="{
            path: '/backoffice/documentos/novo',
            query: {
              type: 'orcamento',
              sourceType: 'manutencao',
              sourceId: nextMaintenance.id,
              clientId: equipment.client?.id || undefined,
              buyerName: equipment.ownerName || undefined,
              description: nextMaintenance.nextDueNotes || `Manutenção — ${equipment.brand} ${equipment.model}`,
              date: nextMaintenance.nextDueDate,
            },
          }"
          class="inline-block text-xs text-brand-500 hover:underline mt-2"
        >
          Emitir Orçamento
        </NuxtLink>
      </template>
      <p v-else class="text-sm text-gray-500 dark:text-zinc-400">
        Sem próxima manutenção agendada. Define a data e o que é preciso fazer ao registar ou editar uma manutenção.
      </p>
    </BaseCard>

    <h2 class="text-lg font-bold mb-3 dark:text-white">Histórico</h2>

    <p v-if="!history.length" class="text-sm text-gray-500 dark:text-zinc-400">
      Ainda não há manutenções registadas para este equipamento.
    </p>

    <ul v-else class="space-y-3">
      <li
        v-for="m in history"
        :key="m.id"
        class="border border-gray-200 dark:border-zinc-800 rounded-lg p-3 text-sm"
      >
        <div class="flex items-center justify-between">
          <span class="font-semibold dark:text-white">{{ m.performedAt }}</span>
          <div class="space-x-3">
            <NuxtLink
              :to="{
                path: '/backoffice/documentos/novo',
                query: {
                  type: 'fatura',
                  sourceType: 'manutencao',
                  sourceId: m.id,
                  clientId: equipment.client?.id || undefined,
                  buyerName: equipment.ownerName || undefined,
                  description: m.description,
                  date: m.performedAt,
                },
              }"
              class="text-xs text-brand-500 hover:underline"
            >
              Emitir Fatura
            </NuxtLink>
            <NuxtLink :to="`/backoffice/manutencoes/${m.id}`" class="text-xs text-brand-500 hover:underline">Editar</NuxtLink>
            <button class="text-xs text-red-600 hover:underline" @click="removeMaintenance(m.id)">Apagar</button>
          </div>
        </div>
        <p class="text-gray-600 dark:text-zinc-300 mt-1">{{ m.description }}</p>
        <div v-if="m.nextDueDate" class="mt-2 text-xs" :class="isOverdue(m.nextDueDate) ? 'text-red-600 dark:text-red-400 font-semibold' : 'text-gray-400'">
          Próxima manutenção: {{ m.nextDueDate }}
          <span v-if="m.nextDueNotes" class="block text-gray-500 dark:text-zinc-400 font-normal mt-0.5">{{ m.nextDueNotes }}</span>
        </div>
      </li>
    </ul>
  </div>
</template>
