<script setup lang="ts">
import BaseButton from '~/components/atoms/BaseButton/BaseButton.vue'

definePageMeta({ layout: 'backoffice', title: 'Manutenções' })

const maintenances = await useAuthFetch<any[]>('/api/maintenances')

const today = new Date().toISOString().slice(0, 10)
const isOverdue = (date: string | null) => !!date && date < today

const groups = computed(() => {
  const byEquipment = new Map<number, any[]>()
  for (const m of maintenances) {
    if (!m.equipment) continue
    if (!byEquipment.has(m.equipment.id)) byEquipment.set(m.equipment.id, [])
    byEquipment.get(m.equipment.id)!.push(m)
  }

  return Array.from(byEquipment.values())
    .map((items) => {
      const sorted = [...items].sort((a, b) => b.performedAt.localeCompare(a.performedAt))
      const dueDates = items.map((m) => m.nextDueDate).filter(Boolean).sort()
      return {
        equipment: sorted[0].equipment,
        count: sorted.length,
        lastPerformedAt: sorted[0].performedAt,
        nextDueDate: dueDates[0] || null,
      }
    })
    .sort((a, b) => {
      if (!a.nextDueDate && !b.nextDueDate) return 0
      if (!a.nextDueDate) return 1
      if (!b.nextDueDate) return -1
      return a.nextDueDate.localeCompare(b.nextDueDate)
    })
})

const search = ref('')
const filteredGroups = computed(() => {
  const q = search.value.trim().toLowerCase()
  if (!q) return groups.value
  return groups.value.filter((g) =>
    [g.equipment.brand, g.equipment.model, g.equipment.client?.name, g.equipment.ownerName].some((field) => field?.toLowerCase().includes(q))
  )
})
</script>

<template>
  <div>
    <div class="flex flex-wrap items-center justify-between gap-3 mb-6">
      <h1 class="text-2xl font-bold dark:text-white">Manutenções</h1>
      <div class="flex items-center gap-3">
        <div class="relative">
          <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="7" />
            <path stroke-linecap="round" d="M21 21l-4.3-4.3" />
          </svg>
          <input
            v-model="search"
            type="text"
            placeholder="Pesquisar equipamentos..."
            class="w-56 sm:w-72 pl-9 pr-3 py-2 rounded-xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
          />
        </div>
        <BaseButton to="/backoffice/manutencoes/novo" variant="brand">+ Nova Manutenção</BaseButton>
      </div>
    </div>

    <p v-if="!groups.length" class="text-gray-500 dark:text-zinc-400">Ainda não há manutenções registadas.</p>
    <p v-else-if="!filteredGroups.length" class="text-gray-500 dark:text-zinc-400">Nenhum equipamento encontrado para "{{ search }}".</p>

    <div v-else class="overflow-x-auto">
      <table class="w-full bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl overflow-hidden text-sm">
        <thead class="bg-gray-50 dark:bg-zinc-800 text-left text-gray-500 dark:text-zinc-400">
          <tr>
            <th class="px-4 py-3">Equipamento</th>
            <th class="px-4 py-3">Cliente</th>
            <th class="px-4 py-3">Manutenções</th>
            <th class="px-4 py-3">Última</th>
            <th class="px-4 py-3">Próxima</th>
            <th class="px-4 py-3"></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="group in filteredGroups" :key="group.equipment.id" class="border-t border-gray-100 dark:border-zinc-800 text-gray-900 dark:text-zinc-100">
            <td class="px-4 py-3">{{ group.equipment.brand }} {{ group.equipment.model }}</td>
            <td class="px-4 py-3">
              <NuxtLink v-if="group.equipment.client" :to="`/backoffice/clientes/${group.equipment.client.id}`" class="text-brand-500 hover:underline">
                {{ group.equipment.client.name }}
              </NuxtLink>
              <span v-else>{{ group.equipment.ownerName || '—' }}</span>
            </td>
            <td class="px-4 py-3">{{ group.count }}</td>
            <td class="px-4 py-3">{{ group.lastPerformedAt }}</td>
            <td class="px-4 py-3">
              <span v-if="group.nextDueDate" :class="isOverdue(group.nextDueDate) ? 'text-red-600 dark:text-red-400 font-semibold' : ''">
                {{ group.nextDueDate }}
              </span>
              <span v-else class="text-gray-400">—</span>
            </td>
            <td class="px-4 py-3 text-right space-x-3">
              <NuxtLink :to="`/backoffice/manutencoes/equipamento/${group.equipment.id}`" class="text-brand-500 hover:underline">
                Ver detalhes
              </NuxtLink>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
