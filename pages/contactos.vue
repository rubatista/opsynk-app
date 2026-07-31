<script setup lang="ts">
import BaseCard from '~/components/atoms/BaseCard/BaseCard.vue'
import BaseInput from '~/components/atoms/BaseInput/BaseInput.vue'
import BaseButton from '~/components/atoms/BaseButton/BaseButton.vue'

const name = ref('')
const email = ref('')
const phone = ref('')
const message = ref('')
const error = ref('')
const submitting = ref(false)
const submitted = ref(false)

const submit = async () => {
  error.value = ''

  if (!email.value && !phone.value) {
    error.value = 'Indica pelo menos um email ou telefone de contacto.'
    return
  }

  submitting.value = true
  try {
    await $fetch('/api/leads', {
      method: 'POST',
      body: {
        name: name.value,
        email: email.value || null,
        phone: phone.value || null,
        message: message.value,
      },
    })
    submitted.value = true
  } catch (err: any) {
    error.value = err?.data?.statusMessage || 'Erro ao enviar. Tenta novamente.'
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <div>
    <h1 class="text-2xl font-bold mb-6">Contactos</h1>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <BaseCard>
        <p class="text-sm text-gray-500 mb-3">
          Entre em contacto para venda, aluguer ou assistência técnica de empilhadores.
        </p>
        <ul class="text-sm space-y-2">
          <li><span class="font-semibold">Telefone:</span> +351 200 000 000</li>
          <li><span class="font-semibold">Email:</span> geral@opsynk.pt</li>
          <li><span class="font-semibold">Morada:</span> Zona Industrial, Portugal</li>
        </ul>
      </BaseCard>

      <BaseCard>
        <div v-if="submitted" class="text-center py-6">
          <p class="text-brand-500 font-semibold mb-1">Mensagem enviada!</p>
          <p class="text-sm text-gray-500">Entraremos em contacto brevemente.</p>
        </div>

        <form v-else class="space-y-3" @submit.prevent="submit">
          <BaseInput v-model="name" label="Nome" required />
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <BaseInput v-model="email" label="Email" type="email" />
            <BaseInput v-model="phone" label="Telefone" />
          </div>
          <BaseInput v-model="message" label="Mensagem" multiline required />

          <p v-if="error" class="text-sm text-red-600">{{ error }}</p>

          <BaseButton type="submit" variant="brand" :disabled="submitting">
            {{ submitting ? 'A enviar...' : 'Enviar Mensagem' }}
          </BaseButton>
        </form>
      </BaseCard>
    </div>
  </div>
</template>
