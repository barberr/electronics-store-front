<script setup lang="ts">
import { useCart } from '~/composables/useCart';
import type { BrandResponse, Product } from '~/types/product';

const route = useRoute();
const slug = computed(() => route.params.slug as string);
const api = useApi();
const cart = useCart();
const toast = useToast();

const brand = ref<BrandResponse | null>(null);
const products = ref<Product[]>([]);
const pending = ref(true);
const error = ref<any>(null);

const fetchBrandData = async () => {
    try {
        const { data } = await api.get(`/v1/brands/${slug.value}/`, {
            skipAuth: true,
        });

        brand.value = data;
        products.value = data.products || [];
    } catch (err: any) {
        error.value = err.response?.data || err;
        console.error('Brand load error:', err);
    } finally {
        pending.value = false;
    }
};

const refreshBrand = () => {
    pending.value = true;
    error.value = null;
    fetchBrandData();
};

const addToCart = async (product: Product) => {
    const availableVariant = product.variants.find(
        variant => variant.is_active && (variant.stock === null || variant.stock > 0),
    );

    if (!availableVariant) {
        toast.add({
            title: 'Нет в наличии',
            description: 'У товара сейчас нет доступных вариантов',
            color: 'primary',
            icon: 'i-heroicons-exclamation-triangle',
        });
        return;
    }

    await cart.addToCart(availableVariant.id, 1);
};

watch(
    () => slug.value,
    () => {
        if (slug.value) {
            pending.value = true;
            error.value = null;
            fetchBrandData();
        }
    },
    { immediate: true },
);

useSeoMeta({
    title: () => brand.value ? `${brand.value.name} - товары бренда` : 'Бренд',
    description: () => brand.value
        ? `Каталог товаров бренда ${brand.value.name}`
        : 'Товары бренда',
});
</script>

<template>
    <UContainer
        class="max-w-full py-16 px-0"
        :ui="{ padding: '' }"
    >
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
                Загружаем товары бренда...
            </p>
        </div>

        <UAlert
            v-else-if="error"
            color="error"
            title="Ошибка загрузки"
            class="mb-8"
        >
            <template #description>
                {{ error.message || 'Не удалось загрузить товары бренда' }}
            </template>
            <UButton size="sm" color="primary" @click="refreshBrand">
                Попробовать снова
            </UButton>
        </UAlert>

        <div v-else-if="brand">
            <div class="mb-8 flex items-center gap-4">
                <div
                    v-if="brand.logo"
                    class="w-20 h-20 shrink-0 rounded-2xl border border-surface-900 bg-surface-900/40 p-3 flex items-center justify-center overflow-hidden"
                >
                    <NuxtImg
                        :src="brand.logo"
                        :alt="brand.name"
                        class="max-w-full max-h-full object-contain"
                        loading="lazy"
                    />
                </div>

                <div>
                    <h1 class="text-3xl font-bold color-text-100 mb-2">
                        {{ brand.name }}
                    </h1>
                    <p class="text-text-400">
                        {{ products.length }} товаров бренда
                    </p>
                </div>
            </div>

            <div v-if="products.length">
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

            <div
                v-else
                class="text-center py-20 bg-gradient-to-r from-surface-900/40 to-accent-950/50 rounded-2xl border border-surface-900"
            >
                <UIcon
                    name="i-heroicons-shopping-bag-open"
                    class="w-20 h-20 text-text-400 mx-auto mb-4"
                />
                <h3 class="text-xl font-semibold text-text-100 mb-2">
                    У этого бренда пока нет товаров
                </h3>
                <p class="text-text-400 max-w-md mx-auto">
                    Следите за обновлениями ассортимента
                </p>
            </div>
        </div>
    </UContainer>
</template>
