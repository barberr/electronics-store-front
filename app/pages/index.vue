<template>
    <div>
        <HeroBlock v-if="heroBlock" :hero="heroBlock" />
        <UContainer 
            v-if="popularProducts.length > 0"
            class="max-w-full py-12 px-0"
            :ui="{ padding: '' }"
        >
            <div class="mb-8">
                <h2 class="text-3xl font-bold text-gray-900 dark:text-white">
                    Популярные товары
                </h2>
            </div>

            <!-- Слайдер популярных товаров -->
             <UCarousel
                v-slot="{ item }"
                loop
                dots
                arrows
                
                class="max-w-7xl mx-auto"
                :items="popularProducts"
                :ui="{ item: 'basis-full sm:basis-1/2 lg:basis-1/3 flex justify-center' }"
            >
                <ProductCard 
                    class="rounded-lg"
                    :product="item" 
                     @add-to-cart=""
                />
                <!-- <img :src="item" width="234" height="234" class="rounded-lg"> -->
            </UCarousel>
        </UContainer>
        
    </div>
</template>
<script setup lang="ts">
import useApi from '~/composables/useApi';
import { useFormatPrice } from '~/composables/useFormatPrice';
const { formatPrice } = useFormatPrice();

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
