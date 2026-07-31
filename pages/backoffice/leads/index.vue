<script setup lang="ts">
definePageMeta({ layout: 'backoffice', title: 'Pedidos de Contacto' })

const leads = ref(await useAuthFetch<any[]>('/api/leads'))

const toggleStatus = async (lead: any) => {
  const newStatus = lead.status === 'novo' ? 'contactado' : 'novo'
  await useAuthFetch(`/api/leads/${lead.id}`, { method: 'PUT', body: { status: newStatus } })
  lead.status = newStatus
}

const removeLead = async (id: number) => {
  if (!confirm('Apagar este pedido de contacto?')) return
  await useAuthFetch(`/api/leads/${id}`, { method: 'DELETE' })
  leads.value = leads.value.filter((lead) => lead.id !== id)
}
</script>

<template>
  <div>
    <h1 class="text-2xl font-bold mb-6 dark:text-white">Pedidos de Contacto</h1>

    <p v-if="!leads?.length" class="text-gray-500 dark:text-gray-400">Ainda não há pedidos de contacto.</p>

    <div v-else class="overflow-x-auto">
      <table class="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden text-sm">
        <thead class="bg-gray-50 dark:bg-gray-800 text-left text-gray-500 dark:text-gray-400">
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
          <tr v-for="lead in leads" :key="lead.id" class="border-t border-gray-100 dark:border-gray-800 text-gray-900 dark:text-gray-100">
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
                :class="lead.status === 'novo' ? 'bg-brand-100 text-brand-700 dark:bg-brand-500/20 dark:text-brand-300' : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'"
              >
                {{ lead.status === 'novo' ? 'Novo' : 'Contactado' }}
              </span>
            </td>
            <td class="px-4 py-3 text-right space-x-3">
              <button class="text-brand-500 hover:underline" @click="toggleStatus(lead)">
                {{ lead.status === 'novo' ? 'Marcar como contactado' : 'Marcar como novo' }}
              </button>
              <button class="text-red-600 hover:underline" @click="removeLead(lead.id)">Apagar</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
