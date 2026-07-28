<script setup lang="ts">
import HeroSection from '~/components/sections/HeroSection/HeroSection.vue'
import AboutUsSection from '~/components/sections/AboutUsSection/AboutUsSection.vue'
import ProductSlider from '~/components/sections/ProductSlider/ProductSlider.vue'
import ProductCardsSection from '~/components/sections/ProductCardsSection/ProductCardsSection.vue'

definePageMeta({ layout: 'landing' })
</script>

<template>
  <div>
    <HeroSection />
    <AboutUsSection />
    <ProductSlider />
    <ProductCardsSection />
  </div>
</template>
