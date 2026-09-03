<script setup lang="ts">
import BaseButton from '~/components/atoms/BaseButton/BaseButton.vue'
import BaseCard from '~/components/atoms/BaseCard/BaseCard.vue'

definePageMeta({ layout: 'backoffice', title: 'Cliente' })

const route = useRoute()
const id = route.params.id as string

const client = await useAuthFetch<any>(`/api/clients/${id}`)
const equipmentList = await useAuthFetch<any[]>(`/api/equipment?clientId=${id}`)
const rentals = await useAuthFetch<any[]>(`/api/rentals?clientId=${id}`)
const purchases = await useAuthFetch<any[]>(`/api/sales?clientId=${id}`)
const transactions = await useAuthFetch<any[]>(`/api/client-transactions?clientId=${id}`)

const debts = transactions.filter((t: any) => t.type === 'a_receber' && t.status === 'pendente')
const totalDebt = debts.reduce((sum: number, t: any) => sum + t.remainingAmount, 0)
const totalToPay = transactions
  .filter((t: any) => t.type === 'a_pagar' && t.status === 'pendente')
  .reduce((sum: number, t: any) => sum + t.remainingAmount, 0)
</script>

<template>
  <div class="max-w-6xl">
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold dark:text-white">{{ client.name }}</h1>
      <div class="flex gap-3">
        <BaseButton :to="`/backoffice/clientes/${id}/editar`" variant="brand">Editar</BaseButton>
        <BaseButton to="/backoffice/clientes" variant="secondary">Voltar</BaseButton>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
      <div class="lg:col-span-2 space-y-6">
        <BaseCard>
          <h2 class="font-semibold text-sm mb-3 dark:text-white">Equipamentos</h2>

          <p v-if="!equipmentList.length" class="text-sm text-gray-500 dark:text-zinc-400">
            Ainda não há equipamentos associados a este cliente.
          </p>

          <ul v-else class="space-y-2">
            <li
              v-for="item in equipmentList"
              :key="item.id"
              class="flex items-center justify-between border border-gray-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-sm"
            >
              <span class="dark:text-white">{{ item.brand }} {{ item.model }}</span>
              <NuxtLink :to="`/backoffice/equipamentos/${item.id}`" class="text-brand-500 hover:underline">Ver</NuxtLink>
            </li>
          </ul>
        </BaseCard>

        <BaseCard>
          <h2 class="font-semibold text-sm mb-3 dark:text-white">Alugueres</h2>

          <p v-if="!rentals.length" class="text-sm text-gray-500 dark:text-zinc-400">
            Este cliente ainda não alugou nenhum produto.
          </p>

          <ul v-else class="space-y-2">
            <li
              v-for="rental in rentals"
              :key="rental.id"
              class="flex items-center justify-between border border-gray-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-sm"
            >
              <span class="dark:text-white">
                {{ rental.product?.name || '—' }}
                <span class="text-gray-400">
                  ({{ rental.startDate }} — {{ rental.endDate || 'sem data' }}, {{ rental.status === 'ativo' ? 'Ativo' : 'Terminado' }})
                </span>
              </span>
              <NuxtLink v-if="rental.product" :to="`/backoffice/produtos/${rental.product.id}`" class="text-brand-500 hover:underline">Ver</NuxtLink>
            </li>
          </ul>
        </BaseCard>

        <BaseCard>
          <h2 class="font-semibold text-sm mb-3 dark:text-white">Compras</h2>

          <p v-if="!purchases.length" class="text-sm text-gray-500 dark:text-zinc-400">
            Este cliente ainda não comprou nenhum produto.
          </p>

          <ul v-else class="space-y-2">
            <li
              v-for="sale in purchases"
              :key="sale.id"
              class="flex items-center justify-between border border-gray-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-sm"
            >
              <span class="dark:text-white">
                {{ sale.product?.name || '—' }}
                <span class="text-gray-400">({{ sale.date }}, {{ formatCurrency(sale.price) }})</span>
                <span v-if="sale.amountDue > 0" class="text-amber-600 dark:text-amber-400">
                  — falta receber {{ formatCurrency(sale.amountDue) }}
                </span>
              </span>
              <NuxtLink v-if="sale.product" :to="`/backoffice/produtos/${sale.product.id}`" class="text-brand-500 hover:underline">Ver</NuxtLink>
            </li>
          </ul>
        </BaseCard>
      </div>

      <div class="space-y-6">
        <BaseCard>
          <h2 class="font-semibold text-sm mb-3 dark:text-white">Contacto</h2>
          <dl class="space-y-3 text-sm">
            <div>
              <dt class="text-gray-500 dark:text-zinc-400">Telefone</dt>
              <dd class="dark:text-white">{{ client.phone || '—' }}</dd>
            </div>
            <div>
              <dt class="text-gray-500 dark:text-zinc-400">Email</dt>
              <dd class="dark:text-white">{{ client.email || '—' }}</dd>
            </div>
            <div>
              <dt class="text-gray-500 dark:text-zinc-400">Morada</dt>
              <dd class="dark:text-white">{{ client.address || '—' }}</dd>
            </div>
          </dl>
        </BaseCard>

        <BaseCard>
          <h2 class="font-semibold text-sm mb-3 dark:text-white">Finanças</h2>
          <div class="grid grid-cols-2 gap-3 mb-4">
            <div>
              <p class="text-xs text-gray-500 dark:text-zinc-400">Dívidas</p>
              <p class="text-lg font-bold" :class="totalDebt > 0 ? 'text-red-500' : 'text-brand-500'">{{ formatCurrency(totalDebt) }}</p>
            </div>
            <div>
              <p class="text-xs text-gray-500 dark:text-zinc-400">A pagar</p>
              <p class="text-lg font-bold text-brand-500">{{ formatCurrency(totalToPay) }}</p>
            </div>
          </div>

          <p v-if="!debts.length" class="text-sm text-gray-500 dark:text-zinc-400">Sem dívidas pendentes.</p>

          <ul v-else class="space-y-2">
            <li
              v-for="debt in debts"
              :key="debt.id"
              class="flex items-center justify-between border border-gray-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-sm"
            >
              <span class="dark:text-white">
                {{ debt.description }}
                <span class="text-gray-400 block text-xs">
                  {{ debt.date }}
                  <span v-if="debt.remainingAmount < debt.amount">· de {{ formatCurrency(debt.amount) }}</span>
                </span>
              </span>
              <span class="font-semibold text-red-500 shrink-0 ml-2">{{ formatCurrency(debt.remainingAmount) }}</span>
            </li>
          </ul>
        </BaseCard>
      </div>
    </div>
  </div>
</template>
