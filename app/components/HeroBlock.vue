<!-- components/HeroBlock.vue -->

<template>
  <section
    v-if="hero"
    class="relative w-full overflow-hidden bg-bg-950"
  >
    <!-- Видео-фон -->
    <video
      v-if="hero.video_mp4"
      :src="hero.video_mp4"
      autoplay
      muted
      loop
      playsinline
      class="absolute inset-0 w-full h-full object-cover z-0"
    ></video>

    <!-- Фон-заглушка (если нет видео) -->
    <div
      v-else-if="hero.background_image"
      class="absolute inset-0 bg-cover bg-center opacity-20"
      :style="{ backgroundImage: `url(${hero.background_image})` }"
    ></div>

    <!-- Градиентный оверлей для читаемости текста -->
    <div class="absolute inset-0 bg-gradient-to-b from-bg-950/70 via-bg-950/45 to-bg-950/90 z-10"></div>

    <!-- Контент поверх фона -->
    <UContainer class="relative z-20 py-16 md:py-24 flex items-center justify-center min-h-[70vh]">
      <div class="text-center max-w-3xl px-4">
        <h1
          class="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight text-text-100 mb-4"
        >
          {{ hero.title }}
        </h1>

        <p
          v-if="hero.subtitle"
          class="text-lg md:text-xl text-text-100/80 mb-6"
        >
          {{ hero.subtitle }}
        </p>

        <!-- Описание и кнопки — только на десктопах (≥768px) -->
        <template v-if="isDesktopOrTablet">
          <p
            v-if="hero.description"
            class="text-base md:text-lg text-text-400 mb-8 max-w-2xl mx-auto"
          >
            {{ hero.description }}
          </p>

          <div class="flex flex-col sm:flex-row justify-center gap-4">
            <!-- <UButton
              v-if="hero.button_text"
              :to="hero.button_link || `/products/${hero.product_slug}`"
              size="xl"
              color="primary"
              class="px-8 py-4 text-lg font-semibold hover:scale-105 transition-transform"
              icon="i-heroicons-shopping-bag"
            >
              {{ hero.button_text }}
            </UButton> -->
            <UButton
              v-if="hero.product"
              :to="`/products/${hero.product_slug}`"
              size="xl"
              color="neutral"
              class="px-8 py-4 text-lg font-semibold hover:scale-105 transition-transform"
              variant="outline"
            >
              Подробнее
            </UButton>
          </div>
        </template>
      </div>
    </UContainer>
  </section>
</template>

<script setup lang="ts">
import { useMediaQuery } from '@vueuse/core'

const props = defineProps<{
  hero?: HeroBlock
}>() 

// Mobile-first: true только на md (768px) и выше
const isDesktopOrTablet = useMediaQuery('(min-width: 768px)')
</script>
