<template>
    <div>
        <HeroBlock v-if="heroBlock" :hero="heroBlock" />
        <UContainer
            class="max-w-full px-0 py-8 md:py-10"
            :ui="{ padding: '' }"
        >
            <section class="mx-auto max-w-7xl px-4">
                <div
                    class="rounded-[2rem] border border-surface-700 bg-gradient-to-r from-bg-950 via-surface-900 to-bg-950 px-6 py-8 shadow-[0_24px_80px_rgba(0,0,0,0.24)] md:px-10 md:py-10"
                >
                    <div class="max-w-4xl">
                        <span
                            class="mb-4 inline-flex rounded-full border border-surface-700 bg-surface-900 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-text-400"
                        >
                            Финансовое преимущество
                        </span>
                        <h2 class="text-2xl font-bold leading-tight text-text-100 md:text-4xl">
                            Беспроцентная рассрочка
                        </h2>
                        <p class="mt-4 text-base leading-relaxed text-text-400 md:text-lg">
                            Уникальное предложение на рынке. Подари себе уверенность и статус,
                            не переплачивая.
                        </p>
                    </div>
                </div>
            </section>
        </UContainer>
        <UContainer 
            v-if="popularProducts.length > 0"
            class="max-w-full py-12 px-0"
            :ui="{ padding: '' }"
        >
            <section class="mx-auto max-w-7xl px-4">
                <div class="mb-8">
                    <h2 class="text-3xl font-bold text-text-100">
                        Популярные товары
                    </h2>
                </div>

                <!-- Слайдер популярных товаров -->
                 <UCarousel
                    v-slot="{ item }"
                    loop
                    dots
                    arrows
                    :items="popularProducts"
                    :ui="{ item: 'basis-full sm:basis-1/2 lg:basis-1/3 flex justify-center' }"
                >
                    <ProductCard 
                        class="rounded-lg"
                        :product="item"
                    />
                    <!-- <img :src="item" width="234" height="234" class="rounded-lg"> -->
                </UCarousel>
            </section>
        </UContainer>
        
    </div>
</template>
<script setup lang="ts">
import useApi from '~/composables/useApi';

const products = ref<Product[]>([]);
const popularProducts = ref<Product[]>([]);
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

const getProductMinPrice = (product: Product) => {
    const activeVariants = product.variants.filter((variant) => variant.is_active);
    const prices = activeVariants
        .map((variant) => parseFloat(variant.price))
        .filter((price) => !Number.isNaN(price));

    return prices.length ? Math.min(...prices) : Number.POSITIVE_INFINITY;
};

const getProductStock = (product: Product) => {
    return product.variants.reduce((sum, variant) => {
        if (!variant.is_active || variant.stock === null) {
            return sum;
        }

        return sum + variant.stock;
    }, 0);
};

const sortedProducts = computed(() => {
    return [...products.value].sort((a, b) => {
        switch (sortBy.value) {
            case 'name':
                return a.name.localeCompare(b.name);

            case 'price':
                return getProductMinPrice(a) - getProductMinPrice(b);

            case '-price':
                return getProductMinPrice(b) - getProductMinPrice(a);

            case 'stock':
                return getProductStock(a) - getProductStock(b);

            case '-stock':
                return getProductStock(b) - getProductStock(a);

            default:
                return 0;
        }
    });
});

// Hero Block данные
const heroBlock = ref<HeroBlock | null>(null);
const heroPending = ref<boolean>(true);
const heroError = ref<Error | null>(null);

const fetchHeroBlock = async () => {
    const api = useApi();
    try {
        const response = await api.get('/v1/hero-blocks/', {
            skipAuth: true,
            params: {
                status: 'published',
                is_active: true,
                ordering: 'order'
            }
        });
        
        if (response.data?.results?.length) {
            heroBlock.value = response.data.results[0];
        } else {
            heroBlock.value = null;
        }
    } catch (err: any) {
        heroError.value = err.response?.data || err;
        console.error('Failed to fetch hero block:', err);
    } finally {
        heroPending.value = false;
    }
};

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

const fetchPopularProducts = async () => {
    const api = useApi();
    try {
        const response = await api.get('/v1/products/popular/', {
            skipAuth: true,
        });
        popularProducts.value = response.data || [];
        console.log('popularProducts -',popularProducts);
    } catch (err: any) {
        console.warn('Не удалось загрузить популярные товары:', err);
        // Не показываем ошибку пользователю — блок просто не отобразится
    }
};

onMounted(() => {
    fetchProducts();
    fetchHeroBlock();
    fetchPopularProducts();
});
</script>
