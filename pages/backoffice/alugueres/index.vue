<script setup lang="ts">
import BaseButton from '~/components/atoms/BaseButton/BaseButton.vue'

definePageMeta({ layout: 'backoffice', title: 'Alugueres' })

const rentals = ref(await useAuthFetch<any[]>('/api/rentals'))

const today = new Date().toISOString().slice(0, 10)
const isOverdue = (rental: any) => rental.status === 'ativo' && !!rental.endDate && rental.endDate < today

const search = ref('')
const filteredRentals = computed(() => {
  const q = search.value.trim().toLowerCase()
  if (!q) return rentals.value
  return rentals.value.filter((r: any) =>
    [r.product?.name, r.client?.name, r.renterName].some((field) => field?.toLowerCase().includes(q))
  )
})

const expanded = ref<number | null>(null)
const toggleExpanded = (id: number) => {
  expanded.value = expanded.value === id ? null : id
}

const removeRental = async (id: number) => {
  if (!confirm('Apagar este aluguer?')) return
  await useAuthFetch(`/api/rentals/${id}`, { method: 'DELETE' })
  rentals.value = rentals.value.filter((rental) => rental.id !== id)
}
</script>

<template>
  <div>
    <div class="flex flex-wrap items-center justify-between gap-3 mb-6">
      <h1 class="text-2xl font-bold">Alugueres</h1>
      <div class="flex items-center gap-3">
        <div class="relative">
          <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-subtle" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="7" />
            <path stroke-linecap="round" d="M21 21l-4.3-4.3" />
          </svg>
          <input
            v-model="search"
            type="text"
            placeholder="Pesquisar alugueres..."
            class="w-56 sm:w-72 pl-9 pr-3 py-2 rounded-xl border border-line bg-surface text-sm text-ink placeholder-subtle focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
        <BaseButton to="/backoffice/alugueres/novo" variant="brand">+ Novo Aluguer</BaseButton>
      </div>
    </div>

    <p v-if="!rentals?.length" class="text-muted">Ainda não há alugueres registados.</p>
    <p v-else-if="!filteredRentals.length" class="text-muted">Nenhum aluguer encontrado para "{{ search }}".</p>

    <div v-else class="overflow-x-auto">
      <table class="w-full bg-surface border border-line rounded-xl overflow-hidden text-sm">
        <thead class="bg-surface-muted text-left text-muted">
          <tr>
            <th class="w-10"></th>
            <th class="px-4 py-3">Produto</th>
            <th class="px-4 py-3">Cliente</th>
            <th class="px-4 py-3">Início</th>
            <th class="px-4 py-3">Fim previsto</th>
            <th class="px-4 py-3">Estado</th>
            <th class="px-4 py-3"></th>
          </tr>
        </thead>
        <tbody>
          <template v-for="rental in filteredRentals" :key="rental.id">
            <tr class="border-t border-line text-ink">
              <td class="pl-4">
                <button
                  class="w-6 h-6 rounded-full flex items-center justify-center text-subtle hover:text-primary-text hover:bg-surface-muted transition"
                  :aria-label="expanded === rental.id ? 'Fechar detalhes' : 'Ver detalhes'"
                  @click="toggleExpanded(rental.id)"
                >
                  <svg
                    class="w-4 h-4 transition-transform"
                    :class="expanded === rental.id ? 'rotate-90' : ''"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </td>
              <td class="px-4 py-3">
                <NuxtLink v-if="rental.product" :to="`/backoffice/produtos/${rental.product.id}`" class="text-primary-text hover:underline">
                  {{ rental.product.name }}
                </NuxtLink>
                <span v-else class="text-subtle">—</span>
              </td>
              <td class="px-4 py-3">
                <NuxtLink v-if="rental.client" :to="`/backoffice/clientes/${rental.client.id}`" class="text-primary-text hover:underline">
                  {{ rental.client.name }}
                </NuxtLink>
                <span v-else>{{ rental.renterName || '—' }}</span>
              </td>
              <td class="px-4 py-3">{{ rental.startDate }}</td>
              <td class="px-4 py-3">
                <span v-if="rental.endDate" :class="isOverdue(rental) ? 'text-danger font-semibold' : ''">
                  {{ rental.endDate }}
                </span>
                <span v-else class="text-subtle">—</span>
              </td>
              <td class="px-4 py-3">
                <span
                  class="inline-block px-2 py-0.5 rounded-full text-xs font-semibold"
                  :class="rental.status === 'ativo' ? 'bg-primary-soft text-primary-text' : 'bg-surface-muted text-ink-soft'"
                >
                  {{ rental.status === 'ativo' ? 'Ativo' : 'Terminado' }}
                </span>
              </td>
              <td class="px-4 py-3 text-right space-x-3">
                <NuxtLink :to="`/backoffice/alugueres/${rental.id}`" class="text-primary-text hover:underline">Editar</NuxtLink>
                <button class="text-danger hover:underline" @click="removeRental(rental.id)">Apagar</button>
              </td>
            </tr>
            <tr v-if="expanded === rental.id" class="border-t border-line bg-surface-muted">
              <td colspan="7" class="px-4 py-4">
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p class="text-xs text-muted mb-1">Contacto</p>
                    <p class="text-ink">{{ rental.renterContact || '—' }}</p>
                  </div>
                  <div>
                    <p class="text-xs text-muted mb-1">Notas</p>
                    <p class="text-ink whitespace-pre-wrap">{{ rental.notes || '—' }}</p>
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
