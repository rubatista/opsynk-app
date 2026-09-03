<script setup lang="ts">
definePageMeta({ layout: 'backoffice', title: 'Pedidos de Contacto' })

const leads = ref(await useAuthFetch<any[]>('/api/leads'))
const { refreshNotifications } = useNotifications()

const search = ref('')
const filteredLeads = computed(() => {
  const q = search.value.trim().toLowerCase()
  if (!q) return leads.value
  return leads.value.filter((lead: any) =>
    [lead.name, lead.email, lead.phone, lead.message].some((field) => field?.toLowerCase().includes(q))
  )
})

const toggleStatus = async (lead: any) => {
  const newStatus = lead.status === 'novo' ? 'contactado' : 'novo'
  await useAuthFetch(`/api/leads/${lead.id}`, { method: 'PUT', body: { status: newStatus } })
  lead.status = newStatus
  refreshNotifications()
}

const removeLead = async (id: number) => {
  if (!confirm('Apagar este pedido de contacto?')) return
  await useAuthFetch(`/api/leads/${id}`, { method: 'DELETE' })
  leads.value = leads.value.filter((lead) => lead.id !== id)
  if (selectedLead.value?.id === id) selectedLead.value = null
  refreshNotifications()
}

const selectedLead = ref<any>(null)
const openLead = (lead: any) => {
  selectedLead.value = lead
}
</script>

<template>
  <div>
    <div class="flex flex-wrap items-center justify-between gap-3 mb-6">
      <h1 class="text-2xl font-bold dark:text-white">Pedidos de Contacto</h1>
      <div class="relative">
        <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="11" cy="11" r="7" />
          <path stroke-linecap="round" d="M21 21l-4.3-4.3" />
        </svg>
        <input
          v-model="search"
          type="text"
          placeholder="Pesquisar pedidos..."
          class="w-56 sm:w-72 pl-9 pr-3 py-2 rounded-xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
        />
      </div>
    </div>

    <p v-if="!leads?.length" class="text-gray-500 dark:text-zinc-400">Ainda não há pedidos de contacto.</p>
    <p v-else-if="!filteredLeads.length" class="text-gray-500 dark:text-zinc-400">Nenhum pedido encontrado para "{{ search }}".</p>

    <div v-else class="overflow-x-auto">
      <table class="w-full bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl overflow-hidden text-sm">
        <thead class="bg-gray-50 dark:bg-zinc-800 text-left text-gray-500 dark:text-zinc-400">
          <tr>
            <th class="px-4 py-3">Nome</th>
            <th class="px-4 py-3">Contacto</th>
            <th class="px-4 py-3">Mensagem</th>
            <th class="px-4 py-3">Data</th>
            <th class="px-4 py-3">Estado</th>
            <th class="px-4 py-3"></th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="lead in filteredLeads"
            :key="lead.id"
            class="border-t border-gray-100 dark:border-zinc-800 text-gray-900 dark:text-zinc-100 cursor-pointer hover:bg-gray-50 dark:hover:bg-zinc-800/50"
            @click="openLead(lead)"
          >
            <td class="px-4 py-3">{{ lead.name }}</td>
            <td class="px-4 py-3">
              <div>{{ lead.email || '—' }}</div>
              <div v-if="lead.phone" class="text-gray-400">{{ lead.phone }}</div>
            </td>
            <td class="px-4 py-3 max-w-xs truncate" :title="lead.message">{{ lead.message }}</td>
            <td class="px-4 py-3">{{ lead.createdAt.slice(0, 10) }}</td>
            <td class="px-4 py-3">
              <span
                class="inline-block px-2 py-0.5 rounded-full text-xs font-semibold"
                :class="lead.status === 'novo' ? 'bg-brand-100 text-brand-700 dark:bg-brand-500/20 dark:text-brand-300' : 'bg-gray-100 text-gray-700 dark:bg-zinc-800 dark:text-zinc-300'"
              >
                {{ lead.status === 'novo' ? 'Novo' : 'Contactado' }}
              </span>
            </td>
            <td class="px-4 py-3 text-right space-x-3" @click.stop>
              <button class="text-brand-500 hover:underline" @click="openLead(lead)">Ver</button>
              <button class="text-brand-500 hover:underline" @click="toggleStatus(lead)">
                {{ lead.status === 'novo' ? 'Marcar como contactado' : 'Marcar como novo' }}
              </button>
              <button class="text-red-600 hover:underline" @click="removeLead(lead.id)">Apagar</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div
      v-if="selectedLead"
      class="fixed inset-0 bg-black/50 z-40 flex items-center justify-center p-4"
      @click.self="selectedLead = null"
    >
      <div class="bg-white dark:bg-zinc-900 rounded-2xl shadow-lg w-full max-w-lg p-6">
        <div class="flex items-start justify-between mb-4">
          <div>
            <h2 class="text-lg font-bold dark:text-white">{{ selectedLead.name }}</h2>
            <p class="text-sm text-gray-500 dark:text-zinc-400">{{ selectedLead.createdAt.slice(0, 10) }}</p>
          </div>
          <button
            class="text-gray-400 hover:text-gray-600 dark:hover:text-zinc-200"
            aria-label="Fechar"
            @click="selectedLead = null"
          >
            <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <dl class="grid grid-cols-2 gap-3 text-sm mb-4">
          <div>
            <dt class="text-gray-500 dark:text-zinc-400">Email</dt>
            <dd class="dark:text-white">{{ selectedLead.email || '—' }}</dd>
          </div>
          <div>
            <dt class="text-gray-500 dark:text-zinc-400">Telefone</dt>
            <dd class="dark:text-white">{{ selectedLead.phone || '—' }}</dd>
          </div>
        </dl>

        <div class="mb-6">
          <dt class="text-sm text-gray-500 dark:text-zinc-400 mb-1">Mensagem</dt>
          <p class="text-sm dark:text-zinc-200 whitespace-pre-wrap">{{ selectedLead.message }}</p>
        </div>

        <div class="flex items-center justify-between">
          <span
            class="inline-block px-2 py-0.5 rounded-full text-xs font-semibold"
            :class="selectedLead.status === 'novo' ? 'bg-brand-100 text-brand-700 dark:bg-brand-500/20 dark:text-brand-300' : 'bg-gray-100 text-gray-700 dark:bg-zinc-800 dark:text-zinc-300'"
          >
            {{ selectedLead.status === 'novo' ? 'Novo' : 'Contactado' }}
          </span>
          <div class="space-x-3">
            <button class="text-sm text-brand-500 hover:underline" @click="toggleStatus(selectedLead)">
              {{ selectedLead.status === 'novo' ? 'Marcar como contactado' : 'Marcar como novo' }}
            </button>
            <button class="text-sm text-red-600 hover:underline" @click="removeLead(selectedLead.id)">Apagar</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
