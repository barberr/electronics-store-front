<template>
    <div>
        <UContainer class="py-8 max-w-7xl">
            <!-- Заголовок -->
            <div class="mb-12">
                <h1
                    class="text-4xl font-bold text-gray-900 dark:text-white mb-2"
                >
                    {{ categoryName }}
                </h1>
                <div v-if="categoryDescription" class="max-w-2xl">
                    <p class="text-lg text-gray-600 dark:text-gray-300">
                        {{ categoryDescription }}
                    </p>
                </div>
            </div>

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
                <p class="text-gray-500 dark:text-gray-400 text-lg">
                    Загружаем товары...
                </p>
            </div>

            <!-- Ошибка -->
            <UAlert
                v-else-if="error"
                color="red"
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

            <!-- Сетка товаров -->
            <div v-else-if="products.length">
                <!-- Карточки товаров -->
                <div
                    class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-4 gap-6"
                >
                    <ProductCard
                        v-for="product in sortedProducts"
                        :key="product.id"
                        :product="product"
                        @add-to-cart="addToCart"
                    />
                </div>
            </div>

            <!-- Пустой список -->
            <div
                v-else
                class="text-center py-20 bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-900/50 dark:to-slate-900/50 rounded-2xl"
            >
                <UIcon
                    name="i-heroicons-shopping-bag-open"
                    class="w-20 h-20 text-gray-400 dark:text-gray-500 mx-auto mb-4"
                />
                <h3
                    class="text-xl font-semibold text-gray-900 dark:text-white mb-2"
                >
                    Товары в этой категории скоро появятся
                </h3>
                <p class="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
                    Следите за обновлениями ассортимента
                </p>
            </div>
        </UContainer>
    </div>
</template>
<script setup lang="ts">
import type { PageGrid, PageCard } from '@nuxt/ui';
import useApi from '~/composables/useApi';
import { useFormatPrice } from '~/composables/useFormatPrice';
const { formatPrice } = useFormatPrice();

const products = ref<Product[]>([]);
const pending = ref<boolean>(true);
const error = ref<Error | null>(null);

const sortBy = ref<'name' | 'price' | '-price' | 'stock' | '-stock'>('name');
const sortOptions = [
    { label: 'По названию (А-Я)', value: 'name' },
    { label: 'По цене (низкая → высокая)', value: 'price' },
    { label: 'По цене (высокая → низкая)', value: '-price' },
    { label: 'По наличию (много → мало)', value: '-stock' },
    { label: 'По наличию (мало → много)', value: 'stock' },
];

const sortedProducts = computed(() => {
    return [...products.value].sort((a, b) => {
        switch (sortBy.value) {
            case 'name':
                return a.name.localeCompare(b.name);

            case 'price':
                return parseFloat(a.price) - parseFloat(b.price);

            case '-price':
                return parseFloat(b.price) - parseFloat(a.price);

            case 'stock':
                return a.stock - b.stock;

            case '-stock':
                return b.stock - a.stock;

            default:
                return 0;
        }
    });
});

// Функция для получения главного изображения
const getMainImage = (images: any[]) => {
    // Ищем первое изображение с is_main: true
    const mainImage = images.find((img) => img.is_main);
    return mainImage ? mainImage.image : null;
};

const fetchProducts = async () => {
    const api = useApi();
    try {
        const response = await api.get('/v1/products/', {
            skipAuth: true, // 👈 Добавили флаг
        }); // → /api/v1/products/
        products.value = response.data.results;
    } catch (err: any) {
        error.value = err.response?.data || err;
        console.error('Failed to fetch products:', err);
    } finally {
        // console.log('prod-', products.value);
        pending.value = false;
    }
};

onMounted(() => {
    fetchProducts();
});
</script>
