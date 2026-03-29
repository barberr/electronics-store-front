<!-- app/pages/category/[slug].vue -->
<script setup lang="ts">
import { useFormatPrice } from '~/composables/useFormatPrice';
import { useCart } from '~/composables/useCart';
import type { CategoryResponse, Product } from '~/types/product';

const route = useRoute();
const slug = computed(() => route.params.slug as string);
const { formatPrice } = useFormatPrice();
const api = useApi();
const cart = useCart();
const toast = useToast();

// // --- Интерфейсы ---
// interface Product {
//     id: number;
//     name: string;
//     slug: string;
//     price: string;
//     is_available: boolean;
//     stock: number;
//     brand: { id: number; name: string; logo?: string | null } | null;
//     image?: string; // Предполагаем, что API возвращает превью
// }

// interface Category {
//     id: number;
//     name: string;
//     slug: string;
//     description: string;
//     products?: Product[]; // Если API возвращает вложенные товары
// }

// --- Состояние ---
const category = ref<CategoryResponse | null>(null);
const products = ref<Product[]>([]);
const pending = ref(true);
const error = ref<any>(null);

// --- Загрузка данных ---
// Используем useAsyncData для корректного SSR и кэширования
const fetchCategoryData = async () => {
    try {
        // 1. Получаем инфо о категории
        // (Предполагаем, что есть эндпоинт /v1/categories/{slug}/)
        // Если бэкенд отдает товары внутри категории:
        const { data: catData } = await api.get(
            `/v1/categories/${slug.value}/`,
            {
                skipAuth: true, // 👈 Добавили флаг
            },
        );
        category.value = catData;

        // 2. Если товары отдаются отдельным эндпоинтом /v1/categories/{id}/products/
        // или /v1/products/?category={slug}, нужно сделать второй запрос.
        // Пример для вложенных товаров (если они есть в catData):
        if (catData.products) {
            products.value = catData.products;
        } else {
            // Иначе грузим отдельно
            const { data: prodData } = await api.get(
                `/v1/categories/${catData.slug}/products/`,
                {
                    skipAuth: true,
                },
            );
            products.value = prodData.results || prodData;
            console.log('products.value', products.value);
        }
    } catch (err: any) {
        error.value = err.response?.data || err;
        console.error('Category load error:', err);
    } finally {
        pending.value = false;
    }
};

const refreshCategory = () => {
    pending.value = true;
    error.value = null;
    fetchCategoryData();
};

const addToCart = async (product: Product) => {
    const availableVariant = product.variants.find(
        variant => variant.is_active && (variant.stock === null || variant.stock > 0)
    );

    if (!availableVariant) {
        toast.add({
            title: 'Нет в наличии',
            description: 'У товара сейчас нет доступных вариантов',
            color: 'primary',
            icon: 'i-heroicons-exclamation-triangle'
        });
        return;
    }

    await cart.addToCart(availableVariant.id, 1);
};

// --- Watcher для навигации ---
watch(
    () => slug.value,
    () => {
        if (slug.value) {
            pending.value = true;
            error.value = null;
            fetchCategoryData();
        }
    },
    { immediate: true },
);

// --- SEO ---
useSeoMeta({
    title: () => category.value?.name || 'Категория',
    description: () => category.value?.description || 'Товары категории',
});
</script>

<template>
    <UContainer 
        class="max-w-full py-16 px-0"
        :ui="{ padding: '' }"
    >

            <!-- Загрузка -->
            <div
                v-if="pending"
                class="flex flex-col items-center justify-center py-20"
            >
                <UProgress
                    value="indeterminate"
                    class="w-24 h-2 mb-4"
                    color="primary"
                />
                <p class="text-text-400 text-lg">
                    Загружаем товары...
                </p>
            </div>

            <!-- Ошибка -->
            <UAlert
                v-else-if="error"
                color="error"
                title="Ошибка загрузки"
                class="mb-8"
            >
                <template #description>
                    {{ error.message || 'Не удалось загрузить товары' }}
                </template>
                <UButton size="sm" color="primary" @click="refreshCategory">
                    Попробовать снова
                </UButton>
            </UAlert>

            <div v-else-if="category">
                <!-- Заголовок категории -->
                <div class="mb-8">
                    <h1 class="category-title text-3xl font-bold color-text-100 mb-2">
                        {{ category.name }}
                    </h1>
                    <p v-if="category.description" class="text-text-400 max-w-3xl">
                        {{ category.description }}
                    </p>
                </div>

                <!-- Сетка товаров -->
                <div v-if="products.length">
                    <!-- Карточки товаров -->
                    <div
                        class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-4 gap-6 justify-items-center sm:justify-items-stretch"
                    >
                        <ProductCard
                            v-for="product in products"
                            :key="product.id"
                            :product="product"
                            @add-to-cart="addToCart"
                        />
                    </div>
                </div>

                <!-- Пустой список -->
                <div
                    v-else
                    class="text-center py-20 bg-gradient-to-r from-surface-900/40 to-accent-950/50 rounded-2xl border border-surface-900"
                >
                    <UIcon
                        name="i-heroicons-shopping-bag-open"
                        class="w-20 h-20 text-text-400 mx-auto mb-4"
                    />
                    <h3
                        class="text-xl font-semibold text-text-100 mb-2"
                    >
                        Товары в этой категории скоро появятся
                    </h3>
                    <p class="text-text-400 max-w-md mx-auto">
                        Следите за обновлениями ассортимента
                    </p>
                </div>
            </div>
        </UContainer>
    
</template>

<style scoped>
    .category-title {
        text-transform: none;
    }
</style>
