<script setup lang="ts">
import { computed } from 'vue';
import { useFormatPrice } from '~/composables/useFormatPrice';

const props = defineProps<{
    product: Product;
}>();

const { formatPrice } = useFormatPrice();

// Минимальная цена
const minPrice = computed(() => {
    const activeVariants = props.product.variants.filter(
        (v) => v.is_active,
    );
    return activeVariants.length
        ? Math.min(...activeVariants.map((v) => parseFloat(v.price)))
        : null;
});

// Доступность
const isAvailable = computed(() => props.product.is_active); //&& !!minPrice.value);

const firstMedia = computed(() => {
    const [media] = [...props.product.images].sort((a, b) => a.order - b.order);
    if (!media) return null;

    return {
        ...media,
        media_type: media.media_type ?? 'image',
    };
});

// Вариантов в наличии
const availableVariantsCount = computed(() => {
    return props.product.variants.filter(
        (v) => v.is_active,
    ).length;
});

const emit = defineEmits<{
    'add-to-cart': [product: Product];
}>();

const handleAddToCart = () => emit('add-to-cart', props.product);

onMounted(() => {
    // console.log('isAvailable', isAvailable);
});
</script>

<template>
    <NuxtLink
        :to="`/products/${product.slug}`"
        class="group block h-full focus:outline-none "
    >
        <UCard
            class="w-72 md:w-80 h-full flex flex-col overflow-hidden hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 border border-surface-900 bg-[color:color-mix(in_srgb,var(--color-bg-950)_76%,var(--color-surface-900))] ring-0 hover:ring-surface-700/50"
            :ui="{ body: 'p-0' }"
        >
            <!-- Изображение -->
            <div
                class="aspect-[4/3] overflow-hidden bg-[radial-gradient(circle_at_top,_rgb(233_204_2_/_0.08),_transparent_45%),linear-gradient(180deg,color-mix(in_srgb,var(--color-surface-900)_82%,var(--color-bg-950))_0%,color-mix(in_srgb,var(--color-bg-950)_88%,black)_100%)] relative group-hover:brightness-110 transition-all duration-500"
            >
                <video
                    v-if="firstMedia?.media_type === 'video'"
                    :src="firstMedia.image"
                    :aria-label="firstMedia.alt_text || product.name"
                    class="w-full h-full object-contain group-hover:scale-110 transition-transform duration-700"
                    autoplay
                    loop
                    muted
                    playsinline
                    preload="metadata"
                />
                <NuxtImg
                    v-else-if="firstMedia"
                    :src="firstMedia.image"
                    :alt="firstMedia.alt_text || product.name"
                    class="w-full h-full object-contain group-hover:scale-110 transition-transform duration-700"
                    sizes="(max-width: 640px) 150px, (max-width: 1024px) 200px, 250px"
                    loading="lazy"
                />
                <div
                    v-else
                    class="absolute inset-0 flex items-center justify-center"
                >
                    <UIcon
                        name="i-heroicons-photo"
                        class="w-12 h-12 text-text-400"
                    />
                </div>

                <!-- Статусы -->
                <UBadge
                    v-if="product.is_active && !isAvailable"
                    color="primary"
                    variant="solid"
                    size="xs"
                    class="absolute top-3 left-3 z-20 shadow-lg"
                >
                    Предзаказ
                </UBadge>

                <UBadge
                    v-else-if="!product.is_active || !isAvailable"
                    color="neutral"
                    variant="solid"
                    size="xs"
                    class="absolute top-3 right-3 z-20 shadow-lg"
                >
                    Нет в наличии
                </UBadge>

                <UBadge
                    v-if="availableVariantsCount > 1"
                    color="info"
                    variant="outline"
                    size="xs"
                    class="absolute bottom-3 right-3 z-20 shadow-lg backdrop-blur-sm border-surface-700 text-text-100"
                >
                    {{ availableVariantsCount }}+ вар.
                </UBadge>

                <UBadge
                    v-if="firstMedia?.media_type === 'video'"
                    color="neutral"
                    variant="solid"
                    size="xs"
                    class="absolute bottom-3 left-3 z-20 shadow-lg"
                >
                    Видео
                </UBadge>
            </div>

            <!-- Контент -->
            <div class="flex-1 p-3 flex flex-col gap-3 bg-[linear-gradient(180deg,color-mix(in_srgb,var(--color-surface-900)_24%,transparent)_0%,transparent_100%)]">
                <!-- Бренд/Категория -->
                <div class="flex items-center gap-2 flex-wrap">
                    <span
                        v-if="product.brand?.name"
                        class="px-3 py-1 rounded-full text-xs font-semibold bg-surface-900 text-text-100 backdrop-blur-sm shadow-sm"
                    >
                        {{ product.brand.name }}
                    </span>
                    <span class="text-text-400 text-xs"
                        >•</span
                    >
                    <span class="text-xs text-text-400">
                        {{ product.category?.name }}
                    </span>
                </div>

                <!-- Название -->
                <h3
                    class="font-bold text-text-100 text-lg leading-tight line-clamp-2 group-hover:text-text-400 transition-colors"
                >
                    {{ product.name }}
                </h3>

                <!-- Цена -->
                <div
                    class="mt-auto flex flex-col items-end justify-between gap-4 pt-4 border-t border-surface-900/80"
                >
                    <div>
                        <div
                            v-if="minPrice"
                            class="text-2xl lg:text-3xl font-black text-text-100 drop-shadow-sm"
                        >
                            {{ formatPrice(minPrice) }}
                        </div>
                        <div
                            v-if="product.variants.some((v) => v.old_price)"
                            class="text-sm text-text-400 line-through font-medium"
                        >
                            {{
                                formatPrice(
                                    Math.min(
                                        ...product.variants.map((v) =>
                                            parseFloat(v.old_price || '999999'),
                                        ),
                                    ),
                                )
                            }}
                        </div>

                        <!-- Наличие -->
                        <div
                            v-if="isAvailable"
                            class="mt-2 flex items-center gap-2 text-xs text-success font-semibold"
                        >
                            <div
                                class="w-2 h-2 bg-success rounded-full animate-pulse"
                            />
                            Под заказ • 3–5 дней
                        </div>
                    </div>

                    <!-- Кнопка -->
                    <UButton
                        size="lg"
                        :color="isAvailable ? 'neutral' : 'neutral'"
                        :variant="isAvailable ? 'outline' : 'soft'"
                        :disabled="!isAvailable"
                        :class="
                            isAvailable
                                ? 'w-full justify-center rounded-xl px-4 shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all font-semibold min-h-12 !bg-[#E9CC02] !border-[#E9CC02] !text-[#0E0F12] hover:!bg-[#f0df58] hover:!border-[#f0df58]'
                                : 'w-full justify-center rounded-xl px-4 shadow-lg transition-all font-semibold min-h-12'
                        "
                        @click.stop="handleAddToCart"
                    >
                        Подробнее
                        <!-- <UIcon
                            name="i-heroicons-shopping-bag"
                            class="w-5 h-5"
                        /> -->
                    </UButton>
                </div>
            </div>
        </UCard>
    </NuxtLink>
</template>
