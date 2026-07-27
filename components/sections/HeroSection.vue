<script setup lang="ts">
import BaseButton from '~/components/atoms/BaseButton.vue'
</script>

<template>
  <section class="text-center py-16">
    <h1 class="text-4xl font-bold mb-4">Empilhadores para o seu negócio</h1>
    <p class="text-gray-600 max-w-xl mx-auto mb-8">
      Venda, aluguer e manutenção/peças de empilhadores. Soluções à medida da sua operação,
      com equipamento pronto a trabalhar.
    </p>
    <div class="flex justify-center gap-3">
      <BaseButton to="/produtos" variant="primary">Ver Empilhadores</BaseButton>
      <BaseButton to="/contactos" variant="secondary">Fale Connosco</BaseButton>
    </div>
  </section>
</template>
