<!-- app/pages/category/[slug].vue -->
<script setup lang="ts">
import { useFormatPrice } from '~/composables/useFormatPrice';

const route = useRoute();
const slug = computed(() => route.params.slug as string);
const { formatPrice } = useFormatPrice();
const api = useApi();

// --- Интерфейсы ---
interface Product {
    id: number;
    name: string;
    slug: string;
    price: string;
    is_available: boolean;
    stock: number;
    brand: { id: number; name: string; logo?: string | null } | null;
    image?: string; // Предполагаем, что API возвращает превью
}

interface Category {
    id: number;
    name: string;
    slug: string;
    description: string;
    products?: Product[]; // Если API возвращает вложенные товары
}

// --- Состояние ---
const category = ref<Category | null>(null);
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
        }
    } catch (err: any) {
        error.value = err.response?.data || err;
        console.error('Category load error:', err);
    } finally {
        pending.value = false;
    }
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
    <UContainer class="py-8 max-w-7xl">
        <!-- Загрузка -->
        <div
            v-if="pending"
            class="flex flex-col items-center justify-center py-20 space-y-4"
        >
            <UIcon
                name="i-heroicons-arrow-path"
                class="w-10 h-10 animate-spin text-primary"
            />
            <p class="text-gray-500">Загрузка товаров...</p>
        </div>

        <!-- Ошибка -->
        <div v-else-if="error" class="text-center py-20">
            <UIcon
                name="i-heroicons-exclamation-circle"
                class="w-16 h-16 text-red-400 mx-auto mb-4"
            />
            <h2 class="text-2xl font-bold text-gray-900 mb-2">
                Категория не найдена
            </h2>
            <p class="text-gray-500 mb-6">
                Возможно, неправильный адрес или категория удалена
            </p>
            <UButton to="/" color="primary" variant="soft">На главную</UButton>
        </div>

        <!-- Контент -->
        <div v-else-if="category">
            <!-- Заголовок категории -->
            <div class="mb-8">
                <h1 class="text-3xl font-bold text-gray-900 mb-2">
                    {{ category.name }}
                </h1>
                <p v-if="category.description" class="text-gray-600 max-w-3xl">
                    {{ category.description }}
                </p>
            </div>

            <!-- Если товаров нет -->
            <div
                v-if="products.length === 0"
                class="text-center py-12 bg-gray-50 rounded-lg"
            >
                <p class="text-gray-500">В этой категории пока нет товаров.</p>
            </div>

            <!-- Сетка товаров -->
            <div
                v-else
                class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
            >
                <NuxtLink
                    v-for="product in products"
                    :key="product.id"
                    :to="`/products/${product.slug}`"
                    class="group block bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300"
                >
                    <!-- Картинка -->
                    <div
                        class="aspect-[4/3] bg-gray-100 relative overflow-hidden"
                    >
                        <NuxtImg
                            v-if="product.image"
                            :src="product.image"
                            :alt="product.name"
                            class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            sizes="300px"
                        />
                        <div
                            v-else
                            class="w-full h-full flex items-center justify-center text-gray-400"
                        >
                            <UIcon name="i-heroicons-photo" class="w-12 h-12" />
                        </div>

                        <!-- Бейдж наличия (абсолютно) -->
                        <div class="absolute top-2 right-2">
                            <UBadge
                                :color="
                                    product.is_available && product.stock > 0
                                        ? 'green'
                                        : 'gray'
                                "
                                size="xs"
                                variant="solid"
                            >
                                {{
                                    product.is_available && product.stock > 0
                                        ? 'В наличии'
                                        : 'Нет'
                                }}
                            </UBadge>
                        </div>
                    </div>

                    <!-- Инфо -->
                    <div class="p-4 space-y-2">
                        <!-- Бренд -->
                        <div
                            v-if="product.brand"
                            class="text-xs text-gray-500 font-medium uppercase tracking-wide"
                        >
                            {{ product.brand.name }}
                        </div>

                        <!-- Название -->
                        <h3
                            class="font-medium text-gray-900 group-hover:text-primary-600 transition-colors line-clamp-2 min-h-[2.5em]"
                        >
                            {{ product.name }}
                        </h3>

                        <!-- Цена и кнопка -->
                        <div class="flex items-end justify-between pt-2">
                            <div class="font-bold text-lg text-gray-900">
                                {{ formatPrice(product.price) }}
                            </div>

                            <UButton
                                icon="i-heroicons-shopping-bag"
                                size="xs"
                                color="primary"
                                variant="soft"
                                :ui="{ rounded: 'rounded-full' }"
                                @click.prevent=""
                            />
                        </div>
                    </div>
                </NuxtLink>
            </div>
        </div>
    </UContainer>
</template>
