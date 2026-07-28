<script setup lang="ts">
import BaseInput from '~/components/atoms/BaseInput/BaseInput.vue'
import BaseSelect from '~/components/atoms/BaseSelect/BaseSelect.vue'
import BaseButton from '~/components/atoms/BaseButton/BaseButton.vue'

definePageMeta({ layout: 'backoffice', title: 'Editar Equipamento' })

const route = useRoute()
const id = route.params.id as string

const item = await useAuthFetch<any>(`/api/equipment/${id}`)
const products = await useAuthFetch<any[]>('/api/products')
const productOptions = [
  { value: '', label: '— Nenhum —' },
  ...products.map((p: any) => ({ value: String(p.id), label: p.name })),
]

const brand = ref(item.brand)
const model = ref(item.model)
const serialNumber = ref(item.serialNumber || '')
const ownerName = ref(item.ownerName || '')
const ownerContact = ref(item.ownerContact || '')
const notes = ref(item.notes || '')
const productId = ref(item.productId ? String(item.productId) : '')
const error = ref('')

const maintenances = ref(await useAuthFetch<any[]>(`/api/maintenances?equipmentId=${id}`))
const maintenanceHistory = computed(() =>
  [...maintenances.value].sort((a, b) => b.performedAt.localeCompare(a.performedAt))
)
const today = new Date().toISOString().slice(0, 10)
const isMaintenanceOverdue = (date: string | null) => !!date && date < today

const submit = async () => {
  error.value = ''
  try {
    await useAuthFetch(`/api/equipment/${id}`, {
      method: 'PUT',
      body: {
        brand: brand.value,
        model: model.value,
        serialNumber: serialNumber.value || null,
        ownerName: ownerName.value || null,
        ownerContact: ownerContact.value || null,
        notes: notes.value || null,
        productId: productId.value || null,
      },
    })
    navigateTo('/backoffice/equipamentos')
  } catch (err: any) {
    error.value = err?.data?.statusMessage || 'Erro ao guardar equipamento'
  }
}
</script>

<template>
  <div class="max-w-md">
    <h1 class="text-2xl font-bold mb-6 dark:text-white">Editar Equipamento</h1>

    <form class="space-y-4" @submit.prevent="submit">
      <div class="grid grid-cols-2 gap-4">
        <BaseInput v-model="brand" label="Marca" required />
        <BaseInput v-model="model" label="Modelo" required />
      </div>
      <BaseInput v-model="serialNumber" label="Nº de Série" />
      <div class="grid grid-cols-2 gap-4">
        <BaseInput v-model="ownerName" label="Cliente / Dono" placeholder="Deixar em branco se for stock próprio" />
        <BaseInput v-model="ownerContact" label="Contacto do Cliente" />
      </div>
      <BaseSelect v-model="productId" label="Produto associado (opcional)" :options="productOptions" />
      <BaseInput v-model="notes" label="Notas" multiline />

      <p v-if="error" class="text-sm text-red-600 dark:text-red-400">{{ error }}</p>

      <div class="flex gap-3">
        <BaseButton type="submit" variant="brand">Guardar</BaseButton>
        <BaseButton to="/backoffice/equipamentos" variant="secondary">Cancelar</BaseButton>
      </div>
    </form>

    <div class="mt-10">
      <div class="flex items-center justify-between mb-3">
        <h2 class="text-lg font-bold dark:text-white">Manutenções</h2>
        <NuxtLink :to="`/backoffice/manutencoes/novo?equipmentId=${id}`" class="text-sm text-brand-500 hover:underline">
          + Nova Manutenção
        </NuxtLink>
      </div>

      <p v-if="!maintenanceHistory.length" class="text-sm text-gray-500 dark:text-gray-400">
        Ainda não há manutenções registadas.
      </p>

      <ul v-else class="space-y-3">
        <li
          v-for="m in maintenanceHistory"
          :key="m.id"
          class="border border-gray-200 dark:border-gray-800 rounded-lg p-3 text-sm"
        >
          <div class="flex items-center justify-between">
            <span class="font-semibold dark:text-white">{{ m.performedAt }}</span>
            <NuxtLink :to="`/backoffice/manutencoes/${m.id}`" class="text-xs text-brand-500 hover:underline">
              Editar
            </NuxtLink>
          </div>
          <p class="text-gray-600 dark:text-gray-300 mt-1">{{ m.description }}</p>
          <p
            v-if="m.nextDueDate"
            class="text-xs mt-2"
            :class="isMaintenanceOverdue(m.nextDueDate) ? 'text-red-600 dark:text-red-400 font-semibold' : 'text-gray-400'"
          >
            Próxima manutenção: {{ m.nextDueDate }}
          </p>
        </li>
      </ul>
    </div>
  </div>
</template>
