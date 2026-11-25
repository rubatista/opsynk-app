<script setup lang="ts">
import BaseButton from '~/components/atoms/BaseButton/BaseButton.vue'
import BaseBadge from '~/components/atoms/BaseBadge/BaseBadge.vue'
import { BUSINESS_TAGS, TENANT_MODULES } from '#shared/tenantOptions'

definePageMeta({ layout: 'admin', title: 'Empresas' })

const tenants = ref(await useAuthFetch<any[]>('/api/admin/tenants'))

const requestUrl = useRequestURL()
const config = useRuntimeConfig()
const siteUrl = (slug: string) =>
  `${requestUrl.protocol}//${slug}.${config.public.siteBaseDomain}${requestUrl.port ? `:${requestUrl.port}` : ''}`
const domainUrl = (domain: string) => `${requestUrl.protocol}//${domain}`

const tagLabel = (value: string) => BUSINESS_TAGS.find((tag) => tag.value === value)?.label || value
const moduleLabel = (value: string) => TENANT_MODULES.find((mod) => mod.value === value)?.label || value

const search = ref('')
const filteredTenants = computed(() => {
  const q = search.value.trim().toLowerCase()
  if (!q) return tenants.value
  return tenants.value.filter((tenant: any) =>
    [tenant.name, tenant.slug, tenant.domain].some((field) => field?.toLowerCase().includes(q))
  )
})
</script>

<template>
  <div>
    <div class="flex flex-wrap items-center justify-between gap-3 mb-6">
      <h1 class="text-2xl font-bold">Empresas</h1>
      <div class="flex flex-wrap items-center gap-3">
        <div class="relative">
          <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-subtle" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="7" />
            <path stroke-linecap="round" d="M21 21l-4.3-4.3" />
          </svg>
          <input
            v-model="search"
            type="text"
            placeholder="Pesquisar empresas..."
            class="w-56 sm:w-72 pl-9 pr-3 py-2 rounded-xl border border-line bg-surface text-sm text-ink placeholder-subtle focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
        <BaseButton to="/admin/empresas/nova" variant="brand">+ Nova empresa</BaseButton>
      </div>
    </div>

    <p v-if="!tenants?.length" class="text-muted">
      Ainda não há empresas. Cria a primeira para dar acesso a um cliente.
    </p>
    <p v-else-if="!filteredTenants.length" class="text-muted">
      Nenhuma empresa encontrada para "{{ search }}".
    </p>

    <div v-else class="overflow-x-auto">
      <table class="w-full bg-surface border border-line rounded-xl overflow-hidden text-sm">
        <thead class="bg-surface-muted text-left text-muted">
          <tr>
            <th class="px-4 py-3">Empresa</th>
            <th class="px-4 py-3">Site</th>
            <th class="px-4 py-3">Tipo de negócio</th>
            <th class="px-4 py-3">Módulos</th>
            <th class="px-4 py-3">Estado</th>
            <th class="px-4 py-3 text-right">Utilizadores</th>
            <th class="px-4 py-3 text-right">Produtos</th>
            <th class="px-4 py-3"></th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="tenant in filteredTenants"
            :key="tenant.id"
            class="border-t border-line text-ink hover:bg-surface-muted cursor-pointer"
            @click="navigateTo(`/admin/empresas/${tenant.id}`)"
          >
            <td class="px-4 py-3">
              <NuxtLink :to="`/admin/empresas/${tenant.id}`" class="font-semibold hover:text-primary-text" @click.stop>
                {{ tenant.name }}
              </NuxtLink>
            </td>
            <td class="px-4 py-3 whitespace-nowrap">
              <a :href="siteUrl(tenant.slug)" target="_blank" rel="noopener" class="text-primary-text hover:underline" @click.stop>
                {{ tenant.slug }}.{{ config.public.siteBaseDomain }}
              </a>
              <a
                v-if="tenant.domain"
                :href="domainUrl(tenant.domain)"
                target="_blank"
                rel="noopener"
                class="block text-xs text-muted hover:underline"
                @click.stop
              >
                {{ tenant.domain }}
              </a>
            </td>
            <td class="px-4 py-3">
              <div class="flex flex-wrap gap-1">
                <BaseBadge v-for="tag in tenant.businessTags" :key="tag">{{ tagLabel(tag) }}</BaseBadge>
              </div>
            </td>
            <td class="px-4 py-3">
              <div v-if="tenant.modules?.length" class="flex flex-wrap gap-1">
                <BaseBadge v-for="mod in tenant.modules" :key="mod" variant="venda">{{ moduleLabel(mod) }}</BaseBadge>
              </div>
              <span v-else class="text-subtle">—</span>
            </td>
            <td class="px-4 py-3">
              <span
                class="inline-block px-2 py-0.5 rounded-full text-xs font-semibold"
                :class="
                  tenant.status === 'ativo'
                    ? 'bg-success-soft text-success'
                    : 'bg-danger-soft text-danger'
                "
              >
                {{ tenant.status === 'ativo' ? 'Ativo' : 'Suspenso' }}
              </span>
            </td>
            <td class="px-4 py-3 text-right">{{ tenant.userCount }}</td>
            <td class="px-4 py-3 text-right">{{ tenant.productCount }}</td>
            <td class="px-4 py-3 text-right">
              <NuxtLink :to="`/admin/empresas/${tenant.id}`" class="text-primary-text hover:underline" @click.stop>Gerir</NuxtLink>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
