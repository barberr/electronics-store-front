<template>
    <div>
        <UPageSection>
            <h1>Products</h1>

            <!-- Загрузка -->
            <p v-if="pending">Loading...</p>

            <!-- Ошибка -->
            <p v-else-if="error" class="error">Error: {{ error.message }}</p>

            <!-- Успех -->
            <PageGrid v-else-if="products.length">
                <!-- <PageCard v-for="product in products" :key="product.id">
                    >{{ product.name }} — {{ product.price }} ₽
                </PageCard> -->
                <div class="container mx-auto py-8">
                    <div
                        class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                    >
                        <NuxtLink
                            :to="`/products/${product.slug}`"
                            class="block h-full"
                            v-for="product in products"
                        >
                            <UCard
                                :key="product.id"
                                class="h-full hover:shadow-xl transition-all duration-300 group"
                                :ui="{
                                    base: 'overflow-hidden',
                                    header: 'p-0 h-48',
                                    body: 'p-6',
                                }"
                            >
                                <!-- Изображение продукта -->
                                <template #header>
                                    <NuxtImg
                                        v-if="product.images?.[0]?.image"
                                        :src="product.images[0].image"
                                        :alt="product.name"
                                        class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                        loading="lazy"
                                    />
                                    <div
                                        v-else
                                        class="w-full h-full bg-gray-200 flex items-center justify-center"
                                    >
                                        <UIcon
                                            name="i-heroicons-camera"
                                            class="w-16 h-16 text-gray-400"
                                        />
                                    </div>
                                </template>

                                <!-- Контент карточки -->
                                <div class="space-y-3">
                                    <!-- Бренд -->
                                    <div class="flex items-center gap-2">
                                        <NuxtImg
                                            v-if="product.brand?.logo"
                                            :src="product.brand.logo"
                                            :alt="product.brand.name"
                                            class="w-8 h-8 rounded-full object-contain"
                                        />
                                        <span
                                            class="text-sm font-medium text-gray-500"
                                            >{{
                                                product.brand?.name ||
                                                'Без бренда'
                                            }}</span
                                        >
                                    </div>

                                    <!-- Категория -->
                                    <UChip
                                        size="xs"
                                        color="gray"
                                        variant="soft"
                                        class="w-fit"
                                    >
                                        {{
                                            product.category?.name ||
                                            'Без категории'
                                        }}
                                    </UChip>

                                    <!-- Название -->
                                    <h3
                                        class="font-bold text-lg leading-tight line-clamp-2 hover:text-primary transition-colors"
                                    >
                                        {{ product.name }}
                                    </h3>

                                    <!-- Цена и доступность -->
                                    <div
                                        class="flex items-center justify-between"
                                    >
                                        <div
                                            class="text-2xl font-bold text-primary"
                                        >
                                            ₽
                                            {{
                                                parseFloat(
                                                    product.price,
                                                ).toFixed(2)
                                            }}
                                        </div>
                                        <UBadge
                                            v-if="!product.is_available"
                                            color="gray"
                                            variant="solid"
                                        >
                                            Нет в наличии
                                        </UBadge>
                                    </div>

                                    <!-- Кнопка -->
                                    <UButton
                                        block
                                        color="primary"
                                        :disabled="
                                            !product.is_available ||
                                            product.stock === 0
                                        "
                                        @click="() => addToCart(product)"
                                    >
                                        {{
                                            product.is_available &&
                                            product.stock > 0
                                                ? 'В корзину'
                                                : 'Нет в наличии'
                                        }}
                                        <template #trailing>
                                            <UIcon
                                                name="i-heroicons-shopping-bag"
                                            />
                                        </template>
                                    </UButton>
                                </div>
                            </UCard>
                        </NuxtLink>
                    </div>
                </div>
            </PageGrid>

            <p v-else>No products found.</p>
        </UPageSection>
    </div>
</template>
<script setup lang="ts">
import type { PageGrid, PageCard } from '@nuxt/ui';
import useApi from '~/composables/useApi';

const products = ref<any[]>([]);
const pending = ref<boolean>(true);
const error = ref<Error | null>(null);

interface ProductImage {
    id: number;
    image: string;
    is_main: boolean;
}

interface Brand {
    id: number;
    name: string;
    slug: string;
    logo: string;
}

interface Category {
    id: number;
    name: string;
    slug: string;
}

interface Product {
    id: number;
    name: string;
    slug: string;
    category: Category;
    brand: Brand;
    description: string;
    price: string;
    stock: number;
    is_available: boolean;
    images: ProductImage[];
}

const fetchProducts = async () => {
    const api = useApi();
    try {
        const response = await api.get('/products/'); // → /api/v1/products/
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
