<script setup lang="ts">
import { computed } from 'vue';
import { useFormatPrice } from '~/composables/useFormatPrice';

// interface ProductVariant {
//   id: number
//   sku: string | null
//   attributes: Record<string, string>
//   price: string
//   old_price: string | null
//   is_active: boolean
//   stock: number | null
// }

// interface Product {
//   id: number
//   name: string
//   slug: string
//   brand: {
//     id: number
//     name: string
//     slug: string
//   } | null
//   category: {
//     id: number
//     name: string
//     slug: string
//   } | null
//   short_description: string
//   description: string
//   is_active: boolean
//   images: Array<{
//     id: number
//     image: string
//     alt_text: string
//     order: number
//   }>
//   variants: ProductVariant[]
// }

const props = defineProps<{
    product: Product;
}>();

const { formatPrice } = useFormatPrice();

// Минимальная цена среди активных вариантов в наличии
const minPrice = computed(() => {
    const activeVariants = props.product.variants.filter(
        (v) => v.is_active && v.stock !== null && v.stock > 0,
    );
    if (activeVariants.length === 0) return null;
    return Math.min(...activeVariants.map((v) => parseFloat(v.price)));
});

// Общая доступность товара
const isAvailable = computed(() => {
    return props.product.is_active && minPrice.value !== null;
});

// Первое изображение
const firstImage = computed(() => {
    return props.product.images[0]?.image || null;
});

// Кол-во вариантов в наличии
const availableVariantsCount = computed(() => {
    return props.product.variants.filter(
        (v) => v.is_active && v.stock !== null && v.stock > 0,
    ).length;
});

// Логика добавления в корзину
const emit = defineEmits<{
    'add-to-cart': [product: Product];
}>();

const handleAddToCart = () => {
    emit('add-to-cart', props.product);
};
</script>

<template>
    <NuxtLink
        :to="`/products/${product.slug}`"
        class="group block h-full focus:outline-none"
    >
        <UCard
            class="h-full flex flex-col overflow-hidden hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 ring-0 hover:ring-2 hover:ring-primary-500/20"
            :ui="{ body: { padding: 'p-0 sm:p-0' } }"
        >
            <!-- Изображение -->
            <div
                class="aspect-[4/3] overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900/50 dark:to-gray-800/50 relative"
            >
                <NuxtImg
                    v-if="firstImage"
                    :src="firstImage"
                    :alt="product.name"
                    class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    sizes="(max-width: 640px) 150px, (max-width: 1024px) 200px, 250px"
                    loading="lazy"
                />
                <div
                    v-else
                    class="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800"
                >
                    <UIcon
                        name="i-heroicons-photo"
                        class="w-12 h-12 text-gray-400 dark:text-gray-500"
                    />
                </div>

                <!-- Статус предзаказа -->
                <UBadge
                    v-if="product.is_active && !isAvailable"
                    color="orange"
                    variant="solid"
                    size="xs"
                    class="absolute top-2 left-2 z-10 shadow-sm"
                >
                    Предзаказ
                </UBadge>

                <!-- Нет в наличии -->
                <UBadge
                    v-else-if="!product.is_active || !isAvailable"
                    color="gray"
                    variant="solid"
                    size="xs"
                    class="absolute top-2 right-2 z-10 shadow-sm"
                >
                    Нет в наличии
                </UBadge>

                <!-- Вариантов несколько -->
                <UBadge
                    v-if="availableVariantsCount > 1"
                    color="blue"
                    variant="outline"
                    size="xs"
                    class="absolute bottom-2 right-2 z-10 shadow-sm"
                >
                    {{ availableVariantsCount }}+ вар.
                </UBadge>
            </div>

            <!-- Контент -->
            <div class="flex-1 p-4 flex flex-col gap-2">
                <!-- Бренд и категория -->
                <div class="flex items-center gap-2 flex-wrap min-h-[24px]">
                    <span
                        v-if="product.brand?.name"
                        class="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full"
                    >
                        {{ product.brand.name }}
                    </span>
                    <span
                        v-if="product.brand?.name && product.category?.name"
                        class="text-gray-300 dark:text-gray-600"
                        >•</span
                    >
                    <span
                        v-if="product.category?.name"
                        class="text-xs text-gray-500 dark:text-gray-400"
                    >
                        {{ product.category.name }}
                    </span>
                </div>

                <!-- Название -->
                <h3
                    class="font-semibold text-gray-900 dark:text-white text-base leading-snug line-clamp-2 min-h-[2.5em] group-hover:text-primary transition-colors"
                >
                    {{ product.name }}
                </h3>

                <!-- Цена и наличие -->
                <div class="mt-auto pt-4 flex items-end justify-between gap-4">
                    <div>
                        <div
                            v-if="minPrice"
                            class="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white"
                        >
                            {{ formatPrice(minPrice) }}
                        </div>
                        <div
                            v-else
                            class="text-xl sm:text-2xl font-bold text-gray-500 dark:text-gray-400 line-through"
                        >
                            {{ formatPrice(minPrice) }}
                        </div>

                        <!-- Старая цена -->
                        <div
                            v-if="product.variants.some((v) => v.old_price)"
                            class="text-sm text-gray-400 dark:text-gray-500 line-through"
                        >
                            {{
                                formatPrice(
                                    Math.min(
                                        ...product.variants.map((v) =>
                                            parseFloat(v.old_price || '0'),
                                        ),
                                    ),
                                )
                            }}
                        </div>

                        <!-- Наличие -->
                        <div
                            v-if="isAvailable"
                            class="text-xs text-green-600 dark:text-green-400 font-medium flex items-center gap-1 mt-1"
                        >
                            <span
                                class="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"
                            />
                            В наличии ({{ availableVariantsCount }} вар.)
                        </div>
                    </div>

                    <!-- Кнопка в корзину -->
                    <UButton
                        size="sm"
                        color="primary"
                        :variant="isAvailable ? 'solid' : 'soft'"
                        :disabled="!isAvailable"
                        class="rounded-full w-10 h-10 flex items-center justify-center p-0 shrink-0"
                        @click.prevent="handleAddToCart"
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
