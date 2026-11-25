<script setup lang="ts">
import BaseButton from '~/components/atoms/BaseButton/BaseButton.vue'

definePageMeta({ layout: 'backoffice', title: 'Clientes' })

const clients = ref(await useAuthFetch<any[]>('/api/clients'))
const equipment = ref(await useAuthFetch<any[]>('/api/equipment'))

const equipmentCount = (clientId: number) => equipment.value.filter((item) => item.clientId === clientId).length
const clientEquipment = (clientId: number) => equipment.value.filter((item) => item.clientId === clientId)

const search = ref('')
const filteredClients = computed(() => {
  const q = search.value.trim().toLowerCase()
  if (!q) return clients.value
  return clients.value.filter((c: any) =>
    [c.name, c.email, c.phone].some((field) => field?.toLowerCase().includes(q))
  )
})

const expanded = ref<number | null>(null)
const toggleExpanded = (id: number) => {
  expanded.value = expanded.value === id ? null : id
}

const removeClient = async (id: number) => {
  if (!confirm('Apagar este cliente?')) return
  await useAuthFetch(`/api/clients/${id}`, { method: 'DELETE' })
  clients.value = clients.value.filter((client) => client.id !== id)
}
</script>

<template>
  <div>
    <div class="flex flex-wrap items-center justify-between gap-3 mb-6">
      <h1 class="text-2xl font-bold">Clientes</h1>
      <div class="flex items-center gap-3">
        <div class="relative">
          <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-subtle" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="7" />
            <path stroke-linecap="round" d="M21 21l-4.3-4.3" />
          </svg>
          <input
            v-model="search"
            type="text"
            placeholder="Pesquisar clientes..."
            class="w-56 sm:w-72 pl-9 pr-3 py-2 rounded-xl border border-line bg-surface text-sm text-ink placeholder-subtle focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
        <BaseButton to="/backoffice/clientes/novo" variant="brand">+ Novo Cliente</BaseButton>
      </div>
    </div>

    <p v-if="!clients?.length" class="text-muted">Ainda não há clientes registados.</p>
    <p v-else-if="!filteredClients.length" class="text-muted">Nenhum cliente encontrado para "{{ search }}".</p>

    <div v-else class="overflow-x-auto">
      <table class="w-full bg-surface border border-line rounded-xl overflow-hidden text-sm">
        <thead class="bg-surface-muted text-left text-muted">
          <tr>
            <th class="w-10"></th>
            <th class="px-4 py-3">Nome</th>
            <th class="px-4 py-3">Telefone</th>
            <th class="px-4 py-3">Email</th>
            <th class="px-4 py-3">Equipamentos</th>
            <th class="px-4 py-3"></th>
          </tr>
        </thead>
        <tbody>
          <template v-for="client in filteredClients" :key="client.id">
            <tr class="border-t border-line text-ink">
              <td class="pl-4">
                <button
                  class="w-6 h-6 rounded-full flex items-center justify-center text-subtle hover:text-primary-text hover:bg-surface-muted transition"
                  :aria-label="expanded === client.id ? 'Fechar detalhes' : 'Ver detalhes'"
                  @click="toggleExpanded(client.id)"
                >
                  <svg
                    class="w-4 h-4 transition-transform"
                    :class="expanded === client.id ? 'rotate-90' : ''"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </td>
              <td class="px-4 py-3">{{ client.name }}</td>
              <td class="px-4 py-3">{{ client.phone || '—' }}</td>
              <td class="px-4 py-3">{{ client.email || '—' }}</td>
              <td class="px-4 py-3">{{ equipmentCount(client.id) }}</td>
              <td class="px-4 py-3 text-right space-x-3">
                <NuxtLink :to="`/backoffice/clientes/${client.id}`" class="text-primary-text hover:underline">Ver</NuxtLink>
                <NuxtLink :to="`/backoffice/clientes/${client.id}/editar`" class="text-primary-text hover:underline">Editar</NuxtLink>
                <button class="text-danger hover:underline" @click="removeClient(client.id)">Apagar</button>
              </td>
            </tr>
            <tr v-if="expanded === client.id" class="border-t border-line bg-surface-muted">
              <td colspan="6" class="px-4 py-4">
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p class="text-xs text-muted mb-1">Morada</p>
                    <p class="text-ink">{{ client.address || '—' }}</p>
                  </div>
                  <div>
                    <p class="text-xs text-muted mb-1">Equipamentos</p>
                    <p v-if="!clientEquipment(client.id).length" class="text-subtle">Nenhum</p>
                    <p v-else class="text-ink">
                      {{ clientEquipment(client.id).map((item) => `${item.brand} ${item.model}`).join(', ') }}
                    </p>
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
