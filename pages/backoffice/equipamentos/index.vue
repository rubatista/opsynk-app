<script setup lang="ts">
import BaseButton from '~/components/atoms/BaseButton/BaseButton.vue'

definePageMeta({ layout: 'backoffice', title: 'Equipamentos' })

const items = ref(await useAuthFetch<any[]>('/api/equipment'))

const search = ref('')
const filteredItems = computed(() => {
  const q = search.value.trim().toLowerCase()
  if (!q) return items.value
  return items.value.filter((item: any) =>
    [item.brand, item.model, item.serialNumber, item.client?.name, item.ownerName].some((field) => field?.toLowerCase().includes(q))
  )
})

const expanded = ref<number | null>(null)
const toggleExpanded = (id: number) => {
  expanded.value = expanded.value === id ? null : id
}

const removeEquipment = async (id: number) => {
  if (!confirm('Apagar este equipamento? As manutenções associadas também serão apagadas.')) return
  await useAuthFetch(`/api/equipment/${id}`, { method: 'DELETE' })
  items.value = items.value.filter((item) => item.id !== id)
}
</script>

<template>
  <div>
    <div class="flex flex-wrap items-center justify-between gap-3 mb-6">
      <h1 class="text-2xl font-bold">Equipamentos</h1>
      <div class="flex items-center gap-3">
        <div class="relative">
          <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-subtle" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="7" />
            <path stroke-linecap="round" d="M21 21l-4.3-4.3" />
          </svg>
          <input
            v-model="search"
            type="text"
            placeholder="Pesquisar equipamentos..."
            class="w-56 sm:w-72 pl-9 pr-3 py-2 rounded-xl border border-line bg-surface text-sm text-ink placeholder-subtle focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
        <BaseButton to="/backoffice/equipamentos/novo" variant="brand">+ Novo Equipamento</BaseButton>
      </div>
    </div>

    <p v-if="!items?.length" class="text-muted">Ainda não há equipamentos registados.</p>
    <p v-else-if="!filteredItems.length" class="text-muted">Nenhum equipamento encontrado para "{{ search }}".</p>

    <div v-else class="overflow-x-auto">
      <table class="w-full bg-surface border border-line rounded-xl overflow-hidden text-sm">
        <thead class="bg-surface-muted text-left text-muted">
          <tr>
            <th class="w-10"></th>
            <th class="px-4 py-3">Marca / Modelo</th>
            <th class="px-4 py-3">Nº Série</th>
            <th class="px-4 py-3">Cliente</th>
            <th class="px-4 py-3">Produto associado</th>
            <th class="px-4 py-3"></th>
          </tr>
        </thead>
        <tbody>
          <template v-for="item in filteredItems" :key="item.id">
            <tr class="border-t border-line text-ink">
              <td class="pl-4">
                <button
                  class="w-6 h-6 rounded-full flex items-center justify-center text-subtle hover:text-primary-text hover:bg-surface-muted transition"
                  :aria-label="expanded === item.id ? 'Fechar detalhes' : 'Ver detalhes'"
                  @click="toggleExpanded(item.id)"
                >
                  <svg
                    class="w-4 h-4 transition-transform"
                    :class="expanded === item.id ? 'rotate-90' : ''"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </td>
              <td class="px-4 py-3">{{ item.brand }} {{ item.model }}</td>
              <td class="px-4 py-3">{{ item.serialNumber || '—' }}</td>
              <td class="px-4 py-3">
                <NuxtLink v-if="item.client" :to="`/backoffice/clientes/${item.client.id}`" class="text-primary-text hover:underline">
                  {{ item.client.name }}
                </NuxtLink>
                <span v-else>{{ item.ownerName || '—' }}</span>
              </td>
              <td class="px-4 py-3">
                <NuxtLink v-if="item.product" :to="`/backoffice/produtos/${item.product.id}`" class="text-primary-text hover:underline">
                  {{ item.product.name }}
                </NuxtLink>
                <span v-else class="text-subtle">—</span>
              </td>
              <td class="px-4 py-3 text-right space-x-3">
                <NuxtLink :to="`/backoffice/equipamentos/${item.id}`" class="text-primary-text hover:underline">Editar</NuxtLink>
                <button class="text-danger hover:underline" @click="removeEquipment(item.id)">Apagar</button>
              </td>
            </tr>
            <tr v-if="expanded === item.id" class="border-t border-line bg-surface-muted">
              <td colspan="6" class="px-4 py-4">
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p class="text-xs text-muted mb-1">Notas</p>
                    <p class="text-ink whitespace-pre-wrap">{{ item.notes || '—' }}</p>
                  </div>
                  <div>
                    <p class="text-xs text-muted mb-1">Manutenções</p>
                    <NuxtLink :to="`/backoffice/manutencoes/equipamento/${item.id}`" class="text-primary-text hover:underline">
                      Ver histórico
                    </NuxtLink>
                  </div>
                </div>
              </td>
            </tr>
          </template>
        </tbody>
      </table>
    </div>
  </div>
</template>
