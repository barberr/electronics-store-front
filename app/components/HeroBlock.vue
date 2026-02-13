<!-- components/HeroBlock.vue -->

<template>
    <section
        v-if="hero"
        :class="`relative bg-gradient-to-br ${hero.background_color} ${hero.text_color} overflow-hidden`"
    >
        <!-- Фоновое затемнение -->
        <div
            v-if="hero.image"
            class="absolute inset-0 bg-cover bg-center opacity-10"
            :style="{ backgroundImage: `url(${hero.background_image})` }"
        ></div>

        <UContainer class="relative z-10 py-16">
            <div
                class="grid grid-cols-1 lg:grid-cols-2 gap-2 md:gap-12 items-center min-h-[50vh] md:min-h-[70vh] md:max-h-[85vh]"
            >
                <!-- Текстовая часть -->
                <div class="space-y-6 max-w-2xl">
                    <h1
                        class="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight tracking-tight"
                    >
                        {{ hero.title }}
                    </h1>
                    <p
                        v-if="hero.subtitle"
                        class="text-lg md:text-xl text-gray-300 leading-relaxed"
                    >
                        {{ hero.subtitle }}
                    </p>
                    <p
                        v-if="hero.description"
                        class="text-base md:text-lg text-gray-400 leading-relaxed max-w-xl"
                    >
                        {{ hero.description }}
                    </p>
                    <div class="flex flex-col sm:flex-row gap-4 pt-4">
                        <UButton
                            v-if="hero.button_text"
                            :to="hero.button_link || `/products/${hero.product}`"
                            size="xl"
                            color="primary"
                            class="px-8 py-4 text-lg font-semibold hover:scale-105 transition-transform"
                            icon="i-heroicons-shopping-bag"
                        >
                            {{ hero.button_text }}
                        </UButton>
                        <UButton
                            v-if="hero.product"
                            :to="`/products/${hero.product}`"
                            size="xl"
                            color="white"
                            class="px-8 py-4 text-lg font-semibold hover:scale-105 transition-transform"
                            variant="outline"
                        >
                            Подробнее
                        </UButton>
                    </div>
                </div>

                <!-- Изображение -->
                <div
                    v-if="hero.image"
                    class="relative flex justify-center lg:justify-end"
                >
                    <div
                        class="relative w-full max-w-md lg:max-w-lg aspect-[9/16] md:aspect-square"
                    >
                        <div
                            class="absolute inset-0 bg-gradient-to-tr from-primary-500/20 to-purple-500/20 rounded-3xl blur-3xl"
                        ></div>
                        <img
                            :src="hero.image"
                            :alt="hero.title"
                            class="relative z-10 w-full h-full object-contain drop-shadow-2xl"
                        />
                    </div>
                </div>
            </div>
        </UContainer>

        <!-- Декоративный градиент снизу -->
        <div
            class="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-gray-900 to-transparent"
        ></div>
    </section>
</template>

<script setup lang="ts">


const props = defineProps<{
    hero?: HeroBlock;
}>();
</script>