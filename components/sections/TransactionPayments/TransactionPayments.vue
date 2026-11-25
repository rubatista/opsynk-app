<script setup lang="ts">
import BaseInput from '~/components/atoms/BaseInput/BaseInput.vue'
import BaseButton from '~/components/atoms/BaseButton/BaseButton.vue'

const props = defineProps<{ transactionId: number; totalAmount: number }>()
const emit = defineEmits<{ (e: 'updated', transaction: any): void }>()

const payments = ref<any[]>([])
const loading = ref(true)

onMounted(async () => {
  payments.value = await useAuthFetch<any[]>(`/api/client-transactions/${props.transactionId}/payments`)
  loading.value = false
})

const remaining = computed(() => Math.max(props.totalAmount - payments.value.reduce((sum, p) => sum + p.amount, 0), 0))

const amount = ref<number | null>(null)
const date = ref(new Date().toISOString().slice(0, 10))
const notes = ref('')
const error = ref('')
const saving = ref(false)

const registerPayment = async (value: number) => {
  error.value = ''
  saving.value = true
  try {
    const result = await useAuthFetch<any>(`/api/client-transactions/${props.transactionId}/payments`, {
      method: 'POST',
      body: { amount: value, date: date.value, notes: notes.value || null },
    })
    payments.value.unshift(result.payment)
    amount.value = null
    notes.value = ''
    emit('updated', { ...result.transaction, remainingAmount: remaining.value })
  } catch (err: any) {
    error.value = err?.data?.statusMessage || 'Erro ao registar amortização'
  } finally {
    saving.value = false
  }
}

const addPayment = () => {
  if (!amount.value) return
  registerPayment(amount.value)
}

const payInFull = () => registerPayment(remaining.value)

const removePayment = async (paymentId: number) => {
  if (!confirm('Remover esta amortização?')) return
  const result = await useAuthFetch<any>(`/api/client-transactions/${props.transactionId}/payments/${paymentId}`, { method: 'DELETE' })
  payments.value = payments.value.filter((p: any) => p.id !== paymentId)
  emit('updated', { ...result.transaction, remainingAmount: remaining.value })
}
</script>

<template>
  <div class="bg-surface-muted rounded-lg p-3 mt-2 space-y-3">
    <p v-if="loading" class="text-xs text-subtle">A carregar amortizações...</p>
    <template v-else>
      <p v-if="!payments.length" class="text-xs text-muted">Ainda não há amortizações registadas.</p>
      <ul v-else class="space-y-1.5">
        <li v-for="p in payments" :key="p.id" class="flex items-center justify-between text-xs">
          <span>
            {{ p.date }} — <span class="font-semibold">{{ formatCurrency(p.amount) }}</span>
            <span v-if="p.notes" class="text-subtle"> · {{ p.notes }}</span>
          </span>
          <button class="text-danger hover:underline shrink-0 ml-2" @click="removePayment(p.id)">Remover</button>
        </li>
      </ul>

      <div v-if="remaining > 0" class="pt-2 border-t border-line">
        <p class="text-xs text-muted mb-2">
          Em falta: <span class="font-semibold text-warning">{{ formatCurrency(remaining) }}</span>
        </p>
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-2 items-end">
          <BaseInput v-model.number="amount" label="Amortização (€)" type="number" step="0.01" :placeholder="String(remaining)" />
          <BaseInput v-model="date" label="Data" type="date" />
          <BaseInput v-model="notes" label="Notas" />
        </div>
        <div class="flex gap-2 mt-2">
          <BaseButton variant="brand" :disabled="saving" @click="addPayment">Adicionar Amortização</BaseButton>
          <BaseButton variant="secondary" :disabled="saving" @click="payInFull">Pagar tudo ({{ formatCurrency(remaining) }})</BaseButton>
        </div>
        <p v-if="error" class="text-xs text-danger mt-2">{{ error }}</p>
      </div>
      <p v-else class="text-xs text-primary-text font-semibold">Totalmente pago.</p>
    </template>
  </div>
</template>
