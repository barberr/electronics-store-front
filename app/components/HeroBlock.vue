<!-- components/HeroBlock.vue -->

<template>
  <section
    v-if="hero"
    class="w-full bg-bg-950 py-4 md:py-6"
  >
    <UContainer
      class="max-w-full px-0"
      :ui="{ padding: '' }"
    >
      <div class="mx-auto max-w-7xl px-4">
        <div class="relative overflow-hidden rounded-[2rem] bg-bg-950">
          <!-- Видео-фон -->
          <video
            v-if="hero.video_mp4"
            :src="hero.video_mp4"
            autoplay
            muted
            loop
            playsinline
            class="absolute inset-0 h-full w-full object-cover z-0"
          ></video>

          <!-- Фон-заглушка (если нет видео) -->
          <div
            v-else-if="hero.background_image"
            class="absolute inset-0 bg-cover bg-center opacity-20"
            :style="{ backgroundImage: `url(${hero.background_image})` }"
          ></div>

          <!-- Градиентный оверлей для читаемости текста -->
          <div class="absolute inset-0 z-10 bg-gradient-to-b from-bg-950/70 via-bg-950/45 to-bg-950/90"></div>

          <!-- Контент поверх фона -->
          <div class="relative z-20 flex min-h-[calc(100svh-10rem)] items-center justify-center px-6 py-8 md:min-h-[70vh] md:px-10 md:py-24">
            <div class="w-full text-center">
              <h1
                class="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight text-text-100 mb-4"
              >
                {{ hero.title }}
              </h1>

              <p
                v-if="hero.subtitle"
                class="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-semibold leading-tight text-text-100/80 mb-6"
              >
                {{ hero.subtitle }}
              </p>

              <!-- Описание и кнопки — только на десктопах (≥768px) -->
              <template v-if="isDesktopOrTablet">
          <p
            v-if="hero.description"
            class="text-base md:text-lg text-text-400 mb-8 max-w-4xl mx-auto"
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
                    class="app-btn-secondary !bg-[linear-gradient(135deg,rgb(255_255_255_/_0.22)_0%,rgb(196_202_214_/_0.16)_52%,rgb(255_255_255_/_0.1)_100%)] !border-[rgb(255_255_255_/_0.24)] px-8 py-4 text-lg font-semibold hover:scale-105 hover:!bg-[linear-gradient(135deg,rgb(255_255_255_/_0.3)_0%,rgb(210_216_228_/_0.2)_52%,rgb(255_255_255_/_0.14)_100%)] transition-transform"
                    variant="soft"
                  >
                    Подробнее 
                  </UButton>
                </div>
              </template>
            </div>

            <UButton
              v-if="hero.product"
              :to="`/products/${hero.product_slug}`"
              size="xl"
              color="neutral"
              class="absolute bottom-6 right-6 md:bottom-8 md:right-8 px-6 py-3 text-base md:text-lg font-semibold shadow-xl hover:scale-105 transition-transform !bg-[#E9CC02] !border-[#E9CC02] !text-[#0E0F12] hover:!bg-[#f0df58] hover:!border-[#f0df58]"
              variant="outline"
            >
              Купить
            </UButton>
          </div>
        </div>
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
