<script setup lang="ts">
import BaseButton from '~/components/atoms/BaseButton/BaseButton.vue'
import BaseBadge from '~/components/atoms/BaseBadge/BaseBadge.vue'
import BaseCard from '~/components/atoms/BaseCard/BaseCard.vue'

definePageMeta({ layout: 'backoffice', title: 'Produto' })

const route = useRoute()
const id = route.params.id as string

const product = await useAuthFetch<any>(`/api/products/${id}`)

const rentals = product.listingType === 'aluguer' ? await useAuthFetch<any[]>(`/api/rentals?productId=${id}`) : []
const activeRental = rentals.find((rental: any) => rental.status === 'ativo') || null

const sales = product.listingType === 'venda' ? await useAuthFetch<any[]>(`/api/sales?productId=${id}`) : []
const sale = sales[0] || null

const energyLabels: Record<string, string> = {
  eletrico: 'Elétrico',
  diesel: 'Diesel',
  gas: 'Gás',
}
</script>

<template>
  <div class="max-w-6xl">
    <div class="flex items-center justify-between mb-2">
      <h1 class="text-2xl font-bold">{{ product.name }}</h1>
      <div class="flex gap-3">
        <BaseButton :to="`/backoffice/produtos/${id}/editar`" variant="brand">Editar</BaseButton>
        <BaseButton to="/backoffice/produtos" variant="secondary">Voltar</BaseButton>
      </div>
    </div>

    <div class="flex items-center gap-2 mb-6">
      <BaseBadge :variant="product.listingType">
        {{ product.listingType === 'aluguer' ? 'Aluguer' : 'Venda' }}
      </BaseBadge>
      <span
        v-if="product.listingType === 'aluguer'"
        class="text-sm font-semibold"
        :class="activeRental ? 'text-danger' : 'text-subtle'"
      >
        {{
          activeRental
            ? `Alugado${activeRental.client ? ` a ${activeRental.client.name}` : activeRental.renterName ? ` a ${activeRental.renterName}` : ''}${activeRental.endDate ? ` até ${activeRental.endDate}` : ''}`
            : 'Disponível'
        }}
      </span>
      <span
        v-else
        class="text-sm font-semibold"
        :class="sale ? 'text-danger' : 'text-subtle'"
      >
        {{ sale ? `Vendido${sale.client ? ` a ${sale.client.name}` : sale.buyerName ? ` a ${sale.buyerName}` : ''} em ${sale.date}` : 'Disponível' }}
      </span>
      <span v-if="sale && sale.amountDue > 0" class="text-sm font-semibold text-warning">
        (falta receber {{ formatCurrency(sale.amountDue) }})
      </span>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
      <div class="lg:col-span-2 space-y-6">
        <BaseCard v-if="product.images?.length">
          <h2 class="font-semibold text-sm mb-3">Imagens</h2>
          <div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <img
              v-for="image in product.images"
              :key="image.id"
              :src="image.url"
              class="w-full h-36 object-cover rounded-lg"
            />
          </div>
        </BaseCard>

        <BaseCard v-if="product.description">
          <h2 class="font-semibold text-sm mb-2">Descrição</h2>
          <p class="text-sm whitespace-pre-wrap">{{ product.description }}</p>
        </BaseCard>
      </div>

      <BaseCard>
        <h2 class="font-semibold text-sm mb-3">Especificações</h2>
        <dl class="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
          <div>
            <dt class="text-muted">Marca</dt>
            <dd>{{ product.brand || '—' }}</dd>
          </div>
          <div>
            <dt class="text-muted">Modelo</dt>
            <dd>{{ product.model || '—' }}</dd>
          </div>
          <div>
            <dt class="text-muted">Capacidade</dt>
            <dd>{{ product.capacityKg ? `${product.capacityKg} kg` : '—' }}</dd>
          </div>
          <div>
            <dt class="text-muted">Ano</dt>
            <dd>{{ product.year || '—' }}</dd>
          </div>
          <div>
            <dt class="text-muted">Energia</dt>
            <dd>{{ energyLabels[product.energyType] || product.energyType || '—' }}</dd>
          </div>
          <div>
            <dt class="text-muted">Preço</dt>
            <dd>{{ formatCurrency(product.price) }}</dd>
          </div>
          <div>
            <dt class="text-muted">Stock</dt>
            <dd>{{ product.stock }}</dd>
          </div>
        </dl>
      </BaseCard>
    </div>
  </div>
</template>
