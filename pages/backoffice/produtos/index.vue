<script setup lang="ts">
import BaseButton from '~/components/atoms/BaseButton/BaseButton.vue'
import BaseBadge from '~/components/atoms/BaseBadge/BaseBadge.vue'

definePageMeta({ layout: 'backoffice', title: 'Produtos' })

const products = ref(await useAuthFetch<any[]>('/api/products'))
const refresh = async () => {
  products.value = await useAuthFetch<any[]>('/api/products')
}
const rentals = ref(await useAuthFetch<any[]>('/api/rentals'))
const isRented = (productId: number) => rentals.value.some((rental) => rental.productId === productId && rental.status === 'ativo')

const sales = ref(await useAuthFetch<any[]>('/api/sales'))
const isSold = (productId: number) => sales.value.some((sale) => sale.productId === productId)

const search = ref('')
const filteredProducts = computed(() => {
  const q = search.value.trim().toLowerCase()
  if (!q) return products.value || []
  return (products.value || []).filter((p: any) =>
    [p.name, p.brand, p.model].some((field) => field?.toLowerCase().includes(q))
  )
})

const expanded = ref<number | null>(null)
const toggleExpanded = (id: number) => {
  expanded.value = expanded.value === id ? null : id
}

const removeProduct = async (id: number) => {
  if (!confirm('Apagar este produto?')) return
  await useAuthFetch(`/api/products/${id}`, { method: 'DELETE' })
  await refresh()
}
</script>

<template>
  <div>
    <div class="flex flex-wrap items-center justify-between gap-3 mb-6">
      <h1 class="text-2xl font-bold">Produtos</h1>
      <div class="flex items-center gap-3">
        <div class="relative">
          <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-subtle" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="7" />
            <path stroke-linecap="round" d="M21 21l-4.3-4.3" />
          </svg>
          <input
            v-model="search"
            type="text"
            placeholder="Pesquisar produtos..."
            class="w-56 sm:w-72 pl-9 pr-3 py-2 rounded-xl border border-line bg-surface text-sm text-ink placeholder-subtle focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
        <BaseButton to="/backoffice/produtos/novo" variant="brand">+ Novo Produto</BaseButton>
      </div>
    </div>

    <p v-if="!products?.length" class="text-muted">Ainda não há produtos.</p>
    <p v-else-if="!filteredProducts.length" class="text-muted">Nenhum produto encontrado para "{{ search }}".</p>

    <div v-else class="overflow-x-auto">
      <table class="w-full bg-surface border border-line rounded-xl overflow-hidden text-sm">
        <thead class="bg-surface-muted text-left text-muted">
          <tr>
            <th class="w-10"></th>
            <th class="px-4 py-3">Nome</th>
            <th class="px-4 py-3">Marca</th>
            <th class="px-4 py-3">Modelo</th>
            <th class="px-4 py-3">Tipo</th>
            <th class="px-4 py-3">Preço</th>
            <th class="px-4 py-3">Stock</th>
            <th class="px-4 py-3"></th>
          </tr>
        </thead>
        <tbody>
          <template v-for="product in filteredProducts" :key="product.id">
            <tr class="border-t border-line text-ink">
              <td class="pl-4">
                <button
                  class="w-6 h-6 rounded-full flex items-center justify-center text-subtle hover:text-primary-text hover:bg-surface-muted transition"
                  :aria-label="expanded === product.id ? 'Fechar detalhes' : 'Ver detalhes'"
                  @click="toggleExpanded(product.id)"
                >
                  <svg
                    class="w-4 h-4 transition-transform"
                    :class="expanded === product.id ? 'rotate-90' : ''"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </td>
              <td class="px-4 py-3">{{ product.name }}</td>
              <td class="px-4 py-3">{{ product.brand || '—' }}</td>
              <td class="px-4 py-3">{{ product.model || '—' }}</td>
              <td class="px-4 py-3">
                <BaseBadge :variant="product.listingType">
                  {{ product.listingType === 'aluguer' ? 'Aluguer' : 'Venda' }}
                </BaseBadge>
                <span
                  v-if="product.listingType === 'aluguer'"
                  class="ml-2 text-xs"
                  :class="isRented(product.id) ? 'text-danger' : 'text-subtle'"
                >
                  {{ isRented(product.id) ? 'Alugado' : 'Disponível' }}
                </span>
                <span
                  v-else
                  class="ml-2 text-xs"
                  :class="isSold(product.id) ? 'text-danger' : 'text-subtle'"
                >
                  {{ isSold(product.id) ? 'Vendido' : 'Disponível' }}
                </span>
              </td>
              <td class="px-4 py-3">{{ formatCurrency(product.price) }}</td>
              <td class="px-4 py-3">{{ product.stock }}</td>
              <td class="px-4 py-3 text-right space-x-3">
                <NuxtLink :to="`/backoffice/produtos/${product.id}`" class="text-primary-text hover:underline">
                  Ver
                </NuxtLink>
                <NuxtLink :to="`/backoffice/produtos/${product.id}/editar`" class="text-primary-text hover:underline">
                  Editar
                </NuxtLink>
                <button class="text-danger hover:underline" @click="removeProduct(product.id)">
                  Apagar
                </button>
              </td>
            </tr>
            <tr v-if="expanded === product.id" class="border-t border-line bg-surface-muted">
              <td colspan="8" class="px-4 py-4">
                <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p class="text-xs text-muted">Capacidade</p>
                    <p class="text-ink">{{ product.capacityKg ? `${product.capacityKg} kg` : '—' }}</p>
                  </div>
                  <div>
                    <p class="text-xs text-muted">Ano</p>
                    <p class="text-ink">{{ product.year || '—' }}</p>
                  </div>
                  <div>
                    <p class="text-xs text-muted">Energia</p>
                    <p class="text-ink">{{ product.energyType || '—' }}</p>
                  </div>
                  <div>
                    <p class="text-xs text-muted">Imagens</p>
                    <p class="text-ink">{{ product.images?.length || 0 }}</p>
                  </div>
                  <div class="col-span-2 sm:col-span-4">
                    <p class="text-xs text-muted">Descrição</p>
                    <p class="text-ink whitespace-pre-wrap">{{ product.description || '—' }}</p>
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
