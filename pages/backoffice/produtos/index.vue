<script setup lang="ts">
import BaseButton from '~/components/atoms/BaseButton/BaseButton.vue'
import BaseBadge from '~/components/atoms/BaseBadge/BaseBadge.vue'

definePageMeta({ layout: 'backoffice', title: 'Produtos' })

const { data: products, refresh } = await useFetch('/api/products')
const rentals = ref(await useAuthFetch<any[]>('/api/rentals'))
const isRented = (productId: number) => rentals.value.some((rental) => rental.productId === productId && rental.status === 'ativo')

const removeProduct = async (id: number) => {
  if (!confirm('Apagar este produto?')) return
  await useAuthFetch(`/api/products/${id}`, { method: 'DELETE' })
  await refresh()
}
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold dark:text-white">Produtos</h1>
      <BaseButton to="/backoffice/produtos/novo" variant="brand">+ Novo Produto</BaseButton>
    </div>

    <p v-if="!products?.length" class="text-gray-500 dark:text-gray-400">Ainda não há produtos.</p>

    <div v-else class="overflow-x-auto">
      <table class="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden text-sm">
        <thead class="bg-gray-50 dark:bg-gray-800 text-left text-gray-500 dark:text-gray-400">
          <tr>
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
          <tr v-for="product in products" :key="product.id" class="border-t border-gray-100 dark:border-gray-800 text-gray-900 dark:text-gray-100">
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
                :class="isRented(product.id) ? 'text-red-500' : 'text-gray-400'"
              >
                {{ isRented(product.id) ? 'Alugado' : 'Disponível' }}
              </span>
            </td>
            <td class="px-4 py-3">{{ formatCurrency(product.price) }}</td>
            <td class="px-4 py-3">{{ product.stock }}</td>
            <td class="px-4 py-3 text-right space-x-3">
              <NuxtLink :to="`/backoffice/produtos/${product.id}`" class="text-brand-500 hover:underline">
                Editar
              </NuxtLink>
              <button class="text-red-600 hover:underline" @click="removeProduct(product.id)">
                Apagar
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
