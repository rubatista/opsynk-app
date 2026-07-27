<script setup lang="ts">
import BaseCard from '~/components/atoms/BaseCard.vue'
</script>

<template>
  <div>
    <h1 class="text-2xl font-bold mb-6">Contactos</h1>

    <BaseCard class="max-w-md">
      <p class="text-sm text-gray-500 mb-3">
        Entre em contacto para venda, aluguer ou assistência técnica de empilhadores.
      </p>
      <ul class="text-sm space-y-2">
        <li><span class="font-semibold">Telefone:</span> +351 200 000 000</li>
        <li><span class="font-semibold">Email:</span> geral@opsynk.pt</li>
        <li><span class="font-semibold">Morada:</span> Zona Industrial, Portugal</li>
      </ul>
    </BaseCard>
  </div>
</template>
