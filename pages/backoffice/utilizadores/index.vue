<script setup lang="ts">
import BaseButton from '~/components/atoms/BaseButton/BaseButton.vue'

definePageMeta({ layout: 'backoffice', title: 'Utilizadores' })

const users = ref(await useAuthFetch<any[]>('/api/users'))

const refresh = async () => {
  users.value = await useAuthFetch<any[]>('/api/users')
}

const removeUser = async (id: number) => {
  if (!confirm('Apagar este utilizador?')) return
  await useAuthFetch(`/api/users/${id}`, { method: 'DELETE' })
  await refresh()
}
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold">Utilizadores</h1>
      <BaseButton to="/backoffice/utilizadores/novo" variant="brand">+ Novo Utilizador</BaseButton>
    </div>

    <p v-if="!users?.length" class="text-muted">Ainda não há utilizadores.</p>

    <div v-else class="overflow-x-auto">
      <table class="w-full bg-surface border border-line rounded-xl overflow-hidden text-sm">
        <thead class="bg-surface-muted text-left text-muted">
          <tr>
            <th class="px-4 py-3">Nome</th>
            <th class="px-4 py-3">Email</th>
            <th class="px-4 py-3"></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in users" :key="user.id" class="border-t border-line text-ink">
            <td class="px-4 py-3">{{ user.name || '—' }}</td>
            <td class="px-4 py-3">{{ user.email }}</td>
            <td class="px-4 py-3 text-right space-x-3">
              <NuxtLink :to="`/backoffice/utilizadores/${user.id}`" class="text-primary-text hover:underline">
                Editar
              </NuxtLink>
              <button class="text-danger hover:underline" @click="removeUser(user.id)">
                Apagar
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
