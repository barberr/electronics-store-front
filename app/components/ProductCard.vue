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
        (v) => v.is_active && v.stock !== null && v.stock > 0,
    );
    return activeVariants.length
        ? Math.min(...activeVariants.map((v) => parseFloat(v.price)))
        : null;
});

// Доступность
const isAvailable = computed(() => props.product.is_active && !!minPrice.value);

// Первое изображение
const firstImage = computed(() => props.product.images[0]?.image || null);

// Вариантов в наличии
const availableVariantsCount = computed(() => {
    return props.product.variants.filter(
        (v) => v.is_active && v.stock !== null && v.stock > 0,
    ).length;
});

const emit = defineEmits<{
    'add-to-cart': [product: Product];
}>();

const handleAddToCart = () => emit('add-to-cart', props.product);
</script>

<template>
    <NuxtLink
        :to="`/products/${product.slug}`"
        class="group block h-full focus:outline-none"
    >
        <UCard
            class="h-full flex flex-col overflow-hidden hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 border dark:border-accent-800 bg-bg-950/50 dark:bg-surface-900 ring-0 hover:ring-accent-400/30"
            :ui="{ body: { padding: 'p-0' } }"
        >
            <!-- Изображение -->
            <div
                class="aspect-[4/3] overflow-hidden bg-accent-950/50 dark:bg-surface-900/70 relative group-hover:brightness-110 transition-all duration-500"
            >
                <NuxtImg
                    v-if="firstImage"
                    :src="firstImage"
                    :alt="product.name"
                    class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    sizes="(max-width: 640px) 150px, (max-width: 1024px) 200px, 250px"
                    loading="lazy"
                />
                <div
                    v-else
                    class="absolute inset-0 flex items-center justify-center"
                >
                    <UIcon
                        name="i-heroicons-photo"
                        class="w-12 h-12 text-accent-700 dark:text-accent-400"
                    />
                </div>

                <!-- Статусы -->
                <UBadge
                    v-if="product.is_active && !isAvailable"
                    color="warning"
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
                    class="absolute bottom-3 right-3 z-20 shadow-lg backdrop-blur-sm"
                >
                    {{ availableVariantsCount }}+ вар.
                </UBadge>
            </div>

            <!-- Контент -->
            <div class="flex-1 p-6 flex flex-col gap-3">
                <!-- Бренд/Категория -->
                <div class="flex items-center gap-2 flex-wrap">
                    <span
                        v-if="product.brand?.name"
                        class="px-3 py-1 rounded-full text-xs font-semibold bg-accent-900/80 dark:bg-accent-800/70 text-accent-200 backdrop-blur-sm shadow-sm"
                    >
                        {{ product.brand.name }}
                    </span>
                    <span class="text-accent-600 dark:text-accent-400 text-xs"
                        >•</span
                    >
                    <span class="text-xs text-accent-500 dark:text-accent-400">
                        {{ product.category?.name }}
                    </span>
                </div>

                <!-- Название -->
                <h3
                    class="font-bold text-text-100 text-lg leading-tight line-clamp-2 group-hover:text-primary transition-colors"
                >
                    {{ product.name }}
                </h3>

                <!-- Цена -->
                <div
                    class="mt-auto flex items-end justify-between gap-4 pt-4 border-t border-accent-800/50"
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
                            class="text-sm text-accent-500 line-through font-medium"
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
                            В наличии ({{ availableVariantsCount }} вар.)
                        </div>
                    </div>

                    <!-- Кнопка -->
                    <UButton
                        size="lg"
                        color="primary"
                        :variant="isAvailable ? 'solid' : 'soft'"
                        :disabled="!isAvailable"
                        class="rounded-xl px-4 shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all font-semibold min-w-[3rem]"
                        @click.stop="handleAddToCart"
                    >
                        <UIcon
                            name="i-heroicons-shopping-bag"
                            class="w-5 h-5"
                        />
                    </UButton>
                </div>
            </div>
        </UCard>
    </NuxtLink>
</template>
