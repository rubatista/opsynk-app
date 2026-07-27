<script setup lang="ts">
import BaseButton from '~/components/atoms/BaseButton.vue'
import BaseBadge from '~/components/atoms/BaseBadge.vue'

definePageMeta({ layout: 'backoffice' })

const { data: products, refresh } = await useFetch('/api/products')

const removeProduct = async (id: number) => {
  if (!confirm('Apagar este produto?')) return
  await useAuthFetch(`/api/products/${id}`, { method: 'DELETE' })
  await refresh()
}
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold">Produtos</h1>
      <BaseButton to="/backoffice/produtos/novo">+ Novo Produto</BaseButton>
    </div>

    <p v-if="!products?.length" class="text-gray-500">Ainda não há produtos.</p>

    <table v-else class="w-full bg-white border border-gray-200 rounded-xl overflow-hidden text-sm">
      <thead class="bg-gray-50 text-left text-gray-500">
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
        <tr v-for="product in products" :key="product.id" class="border-t border-gray-100">
          <td class="px-4 py-3">{{ product.name }}</td>
          <td class="px-4 py-3">{{ product.brand || '—' }}</td>
          <td class="px-4 py-3">{{ product.model || '—' }}</td>
          <td class="px-4 py-3">
            <BaseBadge :variant="product.listingType">
              {{ product.listingType === 'aluguer' ? 'Aluguer' : 'Venda' }}
            </BaseBadge>
          </td>
          <td class="px-4 py-3">{{ product.price.toFixed(2) }} €</td>
          <td class="px-4 py-3">{{ product.stock }}</td>
          <td class="px-4 py-3 text-right space-x-3">
            <NuxtLink :to="`/backoffice/produtos/${product.id}`" class="text-indigo-600 hover:underline">
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
</template>
