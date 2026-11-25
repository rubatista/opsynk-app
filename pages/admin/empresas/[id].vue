<script setup lang="ts">
import BaseInput from '~/components/atoms/BaseInput/BaseInput.vue'
import BaseButton from '~/components/atoms/BaseButton/BaseButton.vue'
import BaseCard from '~/components/atoms/BaseCard/BaseCard.vue'
import { BUSINESS_TAGS, TENANT_MODULES, TENANT_STATUSES } from '#shared/tenantOptions'

definePageMeta({ layout: 'admin', title: 'Empresa' })

const route = useRoute()
const id = route.params.id

const tenant = ref(await useAuthFetch<any>(`/api/admin/tenants/${id}`))
const tenantUsers = ref<any[]>(tenant.value.users || [])

const requestUrl = useRequestURL()
const config = useRuntimeConfig()
const siteUrl = (slug: string) =>
  `${requestUrl.protocol}//${slug}.${config.public.siteBaseDomain}${requestUrl.port ? `:${requestUrl.port}` : ''}`

const formatDate = (value: string) => {
  const date = new Date(`${value.replace(' ', 'T')}Z`)
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString('pt-PT')
}

// --- Tenant settings ---
const name = ref(tenant.value.name)
const slug = ref(tenant.value.slug)
const domain = ref(tenant.value.domain || '')
const tags = ref<string[]>([...(tenant.value.businessTags || [])])
const modules = ref<string[]>([...(tenant.value.modules || [])])
const status = ref<string>(tenant.value.status)
const saveError = ref('')
const saved = ref(false)
const saving = ref(false)

const save = async () => {
  saveError.value = ''
  saved.value = false
  if (!tags.value.length) {
    saveError.value = 'Escolhe pelo menos um tipo de negócio.'
    return
  }

  saving.value = true
  try {
    const updated = await useAuthFetch<any>(`/api/admin/tenants/${id}`, {
      method: 'PUT',
      body: {
        name: name.value,
        slug: slug.value,
        domain: domain.value || null,
        businessTags: tags.value,
        modules: modules.value,
        status: status.value,
      },
    })
    tenant.value = { ...tenant.value, ...updated }
    domain.value = updated.domain || ''
    saved.value = true
  } catch (err: any) {
    saveError.value = err?.data?.statusMessage || 'Erro ao guardar alterações'
  } finally {
    saving.value = false
  }
}

// --- Users ---
const resetUserId = ref<number | null>(null)
const resetPassword = ref('')
const resetError = ref('')
const resetDoneFor = ref<number | null>(null)

const startReset = (userId: number) => {
  resetUserId.value = userId
  resetPassword.value = ''
  resetError.value = ''
  resetDoneFor.value = null
}

const submitReset = async () => {
  resetError.value = ''
  try {
    await useAuthFetch(`/api/admin/users/${resetUserId.value}`, {
      method: 'PUT',
      body: { password: resetPassword.value },
    })
    resetDoneFor.value = resetUserId.value
    resetUserId.value = null
  } catch (err: any) {
    resetError.value = err?.data?.statusMessage || 'Erro ao repor password'
  }
}

const newUserName = ref('')
const newUserEmail = ref('')
const newUserPassword = ref('')
const newUserError = ref('')

const addUser = async () => {
  newUserError.value = ''
  try {
    const created = await useAuthFetch<any>(`/api/admin/tenants/${id}/users`, {
      method: 'POST',
      body: { name: newUserName.value || null, email: newUserEmail.value, password: newUserPassword.value },
    })
    tenantUsers.value = [...tenantUsers.value, created]
    newUserName.value = ''
    newUserEmail.value = ''
    newUserPassword.value = ''
  } catch (err: any) {
    newUserError.value = err?.data?.statusMessage || 'Erro ao adicionar utilizador'
  }
}
</script>

<template>
  <div class="max-w-3xl">
    <NuxtLink to="/admin" class="text-sm text-muted hover:text-primary-text">← Empresas</NuxtLink>
    <div class="flex flex-wrap items-center justify-between gap-3 mt-2 mb-6">
      <h1 class="text-2xl font-bold">{{ tenant.name }}</h1>
      <a
        :href="siteUrl(tenant.slug)"
        target="_blank"
        rel="noopener"
        class="text-sm text-primary-text hover:underline break-all"
      >
        Abrir site ↗
      </a>
    </div>

    <form class="space-y-6" @submit.prevent="save">
      <BaseCard>
        <h2 class="font-semibold text-sm mb-3">Empresa</h2>
        <div class="space-y-3">
          <BaseInput v-model="name" label="Nome" required />
          <div>
            <BaseInput v-model="slug" label="Endereço do site" required />
            <p class="text-xs text-subtle mt-1 break-all">
              {{ siteUrl(slug || 'empresa') }} — alterar o endereço muda o link do site do cliente.
            </p>
          </div>
          <BaseInput v-model="domain" label="Domínio próprio (opcional)" placeholder="www.standsilva.pt" />
        </div>
      </BaseCard>

      <BaseCard>
        <h2 class="font-semibold text-sm mb-1">Estado</h2>
        <p class="text-xs text-subtle mb-3">
          Uma empresa suspensa não consegue entrar no backoffice e o site público fica offline. Os dados mantêm-se.
        </p>
        <div class="flex flex-wrap gap-2">
          <label
            v-for="option in TENANT_STATUSES"
            :key="option.value"
            class="flex items-center gap-2 px-3 py-2 rounded-xl border text-sm cursor-pointer"
            :class="
              status === option.value
                ? option.value === 'ativo'
                  ? 'border-success bg-success-soft'
                  : 'border-danger bg-danger-soft'
                : 'border-line hover:bg-surface-muted'
            "
          >
            <input v-model="status" type="radio" name="status" :value="option.value" class="accent-primary" />
            {{ option.label }}
          </label>
        </div>
      </BaseCard>

      <BaseCard>
        <h2 class="font-semibold text-sm mb-1">Tipo de negócio</h2>
        <p class="text-xs text-subtle mb-3">Define o que a empresa vê no feed entre comerciantes.</p>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <label
            v-for="tag in BUSINESS_TAGS"
            :key="tag.value"
            class="flex items-center gap-2 px-3 py-2 rounded-xl border border-line text-sm cursor-pointer hover:bg-surface-muted"
          >
            <input v-model="tags" type="checkbox" :value="tag.value" class="accent-primary" />
            {{ tag.label }}
          </label>
        </div>
      </BaseCard>

      <BaseCard>
        <h2 class="font-semibold text-sm mb-1">Módulos</h2>
        <p class="text-xs text-subtle mb-3">
          Secções extra do backoffice. Produtos, clientes, finanças, faturas e contactos estão sempre ativos.
        </p>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <label
            v-for="mod in TENANT_MODULES"
            :key="mod.value"
            class="flex items-center gap-2 px-3 py-2 rounded-xl border border-line text-sm cursor-pointer hover:bg-surface-muted"
          >
            <input v-model="modules" type="checkbox" :value="mod.value" class="accent-primary" />
            {{ mod.label }}
          </label>
        </div>
      </BaseCard>

      <p v-if="saveError" class="text-sm text-danger">{{ saveError }}</p>
      <p v-if="saved" class="text-sm text-success">Alterações guardadas.</p>

      <BaseButton type="submit" variant="brand" :disabled="saving">{{ saving ? 'A guardar...' : 'Guardar alterações' }}</BaseButton>
    </form>

    <section class="mt-10">
      <h2 class="text-lg font-bold mb-3">Utilizadores</h2>

      <p v-if="!tenantUsers.length" class="text-sm text-muted mb-4">Esta empresa ainda não tem utilizadores.</p>

      <div v-else class="overflow-x-auto mb-6">
        <table class="w-full bg-surface border border-line rounded-xl overflow-hidden text-sm">
          <thead class="bg-surface-muted text-left text-muted">
            <tr>
              <th class="px-4 py-3">Nome</th>
              <th class="px-4 py-3">Email</th>
              <th class="px-4 py-3">Criado</th>
              <th class="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            <template v-for="user in tenantUsers" :key="user.id">
              <tr class="border-t border-line text-ink">
                <td class="px-4 py-3">{{ user.name || '—' }}</td>
                <td class="px-4 py-3 break-all">{{ user.email }}</td>
                <td class="px-4 py-3 whitespace-nowrap">{{ formatDate(user.createdAt) }}</td>
                <td class="px-4 py-3 text-right whitespace-nowrap">
                  <span v-if="resetDoneFor === user.id" class="text-success mr-3">Password reposta</span>
                  <button class="text-primary-text hover:underline" @click="startReset(user.id)">Repor password</button>
                </td>
              </tr>
              <tr v-if="resetUserId === user.id" class="border-t border-line">
                <td colspan="4" class="px-4 py-3">
                  <form class="flex flex-wrap items-end gap-3" @submit.prevent="submitReset">
                    <BaseInput v-model="resetPassword" label="Nova password (mín. 8 caracteres)" type="password" required class="flex-1 min-w-[12rem]" />
                    <BaseButton type="submit" variant="brand">Guardar</BaseButton>
                    <BaseButton variant="secondary" @click="resetUserId = null">Cancelar</BaseButton>
                  </form>
                  <p v-if="resetError" class="text-sm text-danger mt-2">{{ resetError }}</p>
                </td>
              </tr>
            </template>
          </tbody>
        </table>
      </div>

      <BaseCard>
        <h3 class="font-semibold text-sm mb-3">Adicionar utilizador</h3>
        <form class="space-y-3" @submit.prevent="addUser">
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <BaseInput v-model="newUserName" label="Nome" />
            <BaseInput v-model="newUserEmail" label="Email" type="email" required />
            <BaseInput v-model="newUserPassword" label="Password" type="password" required />
          </div>
          <p v-if="newUserError" class="text-sm text-danger">{{ newUserError }}</p>
          <BaseButton type="submit" variant="brand">Adicionar</BaseButton>
        </form>
      </BaseCard>
    </section>
  </div>
</template>
