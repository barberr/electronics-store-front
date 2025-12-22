<script setup lang="ts">
const route = useRoute();
const slug = computed(() => route.params.slug as string);

// Reactivity refs
const product = ref<Product | null>(null);
const pending = ref<boolean>(true);
const error = ref<Error | null>(null);

// Импортируем useApi из вашего composable
const api = useApi();

// Интерфейсы для типизации
interface ProductImage {
    id: number;
    image: string;
    is_main: boolean;
}

interface Brand {
    id: number;
    name: string;
    slug: string;
    logo: string | null;
}

interface Category {
    id: number;
    name: string;
    slug: string;
    description: string;
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

// Функция загрузки товара (аналог fetchCategories)
const fetchProduct = async () => {
    try {
        console.log('Fetching product by slug:', slug.value);
        const response = await api.get(`/products/${slug.value}/`);
        console.log('Product response -', response);
        product.value = response.data;
    } catch (err: any) {
        error.value = err.response?.data || err;
        console.error('Failed to fetch product:', err);
    } finally {
        console.log('Product loaded:', product.value);
        pending.value = false;
    }
};

// Обновление при смене slug (для клиентской навигации)
watch(
    () => slug.value,
    () => {
        if (slug.value) {
            fetchProduct();
        }
    },
    { immediate: true },
);

// SEO мета-теги
useSeoMeta({
    title: () => product.value?.name || 'Товар',
    description: () => product.value?.description || 'Подробности о товаре',
});
</script>

<template>
    <!-- Остальной шаблон без изменений -->
    <UContainer class="py-12 max-w-7xl">
        <!-- Загрузка -->
        <div v-if="pending" class="flex justify-center py-20">
            <div class="text-center">
                <ULoader size="xl" color="primary" class="mx-auto mb-4" />
                <p class="text-gray-500">Загружаем товар...</p>
            </div>
        </div>

        <!-- Ошибка -->
        <div v-else-if="error" class="text-center py-20">
            <UIcon
                name="i-heroicons-exclamation-triangle"
                class="w-16 h-16 text-red-400 mx-auto mb-4"
            />
            <h2 class="text-2xl font-bold text-gray-800 mb-2">
                Товар не найден
            </h2>
            <p class="text-gray-500 mb-6">
                Возможно, товар удален или slug изменился
            </p>
            <UButton @click="fetchProduct" color="primary">
                Попробовать снова
            </UButton>
        </div>

        <!-- Товар найден -->
        <div v-if="product" class="grid lg:grid-cols-2 gap-12 items-start">
            <div class="space-y-6">
                <!-- Главное изображение -->
                <UCard class="overflow-hidden">
                    <div
                        class="w-full h-96 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center"
                        v-if="!product.images?.length"
                    >
                        <div class="text-center">
                            <UIcon
                                name="i-heroicons-camera"
                                class="w-20 h-20 text-gray-400 mx-auto mb-2"
                            />
                            <p class="text-gray-500">
                                Изображение появится позже
                            </p>
                        </div>
                    </div>
                    <NuxtImg
                        v-else-if="product.images[0]"
                        :src="product.images[0].image"
                        :alt="product.name"
                        class="w-full h-96 object-cover hover:scale-105 transition-transform duration-300"
                        sizes="500px"
                    />
                </UCard>

                <!-- Галерея -->
                <div
                    v-if="product.images && product.images.length > 1"
                    class="grid grid-cols-5 gap-3"
                >
                    <UCard
                        v-for="(img, index) in product.images"
                        :key="img.id"
                        class="overflow-hidden cursor-pointer p-0 hover:shadow-md transition-shadow"
                    >
                        <NuxtImg
                            :src="img.image"
                            :alt="`${product.name} - изображение ${index + 1}`"
                            class="w-full h-20 object-cover"
                            sizes="100px"
                        />
                    </UCard>
                </div>
            </div>

            <!-- Информация о товаре -->
            <div class="space-y-8">
                <!-- Заголовок и бренд -->
                <div class="space-y-3">
                    <div class="flex items-start justify-between gap-4 mb-4">
                        <div>
                            <h1
                                class="text-3xl lg:text-4xl font-bold text-gray-900 leading-tight"
                            >
                                {{ product.name }}
                            </h1>
                            <div
                                class="flex items-center gap-3 mt-3 text-sm text-gray-500"
                            >
                                <span class="font-medium">{{
                                    product.brand?.name || 'Без бренда'
                                }}</span>
                                <UIcon
                                    name="i-heroicons-chevron-right"
                                    class="w-4 h-4"
                                />
                                <span>{{
                                    product.category?.name || 'Без категории'
                                }}</span>
                            </div>
                        </div>
                        <NuxtLink
                            v-if="product.brand?.logo"
                            :to="`/brands/${product.brand.slug}`"
                            class="w-12 h-12 p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                        >
                            <NuxtImg
                                :src="product.brand.logo!"
                                :alt="product.brand.name"
                                class="w-full h-full object-contain"
                            />
                        </NuxtLink>
                    </div>
                </div>

                <!-- Цена и доступность -->
                <UCard class="p-6">
                    <div class="space-y-6">
                        <div class="space-y-2">
                            <div class="flex items-center justify-between">
                                <span
                                    class="text-sm font-medium text-gray-500 uppercase tracking-wide"
                                    >Цена</span
                                >
                            </div>
                            <div
                                class="text-4xl lg:text-5xl font-bold text-primary-600"
                            >
                                {{
                                    Number(product.price).toLocaleString(
                                        'ru-RU',
                                    )
                                }}
                                ₽
                            </div>
                        </div>

                        <div
                            class="flex items-center gap-4 p-4 bg-gray-50 rounded-xl"
                        >
                            <div class="flex items-center gap-2">
                                <UBadge
                                    :color="
                                        product.is_available &&
                                        product.stock > 0
                                            ? 'green'
                                            : 'gray'
                                    "
                                    size="lg"
                                    variant="soft"
                                >
                                    {{
                                        product.is_available &&
                                        product.stock > 0
                                            ? 'В наличии'
                                            : 'Нет в наличии'
                                    }}
                                </UBadge>
                                <span class="text-sm text-gray-600">
                                    Остаток:
                                    {{ product.stock.toLocaleString() }} шт.
                                </span>
                            </div>
                        </div>

                        <div class="grid grid-cols-1 lg:grid-cols-2 gap-3">
                            <UButton
                                size="xl"
                                color="primary"
                                :disabled="
                                    !product.is_available || product.stock === 0
                                "
                                class="text-lg font-semibold h-14"
                            >
                                <UIcon
                                    name="i-heroicons-shopping-bag"
                                    class="w-5 h-5 mr-2"
                                />
                                В корзину
                            </UButton>
                            <UButton
                                size="xl"
                                color="gray"
                                variant="ghost"
                                class="text-lg font-semibold h-14"
                            >
                                <UIcon
                                    name="i-heroicons-heart"
                                    class="w-5 h-5 mr-2"
                                />
                                В избранное
                            </UButton>
                        </div>
                    </div>
                </UCard>

                <!-- Описание -->
                <UCard v-if="product.description" class="p-6">
                    <h2
                        class="text-xl font-semibold mb-4 flex items-center gap-2"
                    >
                        <UIcon
                            name="i-heroicons-information-circle"
                            class="w-6 h-6"
                        />
                        Описание
                    </h2>
                    <div class="prose prose-sm max-w-none">
                        <p>{{ product.description }}</p>
                    </div>
                </UCard>

                <!-- Дополнительная информация -->
                <UCard class="p-6">
                    <h3 class="text-lg font-semibold mb-4">Характеристики</h3>
                    <dl class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                            <dt class="font-medium text-gray-500">Артикул</dt>
                            <dd class="text-gray-900">
                                {{ product.sku || 'N/A' }}
                            </dd>
                        </div>
                        <div>
                            <dt class="font-medium text-gray-500">Категория</dt>
                            <dd class="text-gray-900">
                                {{ product.category?.name }}
                            </dd>
                        </div>
                        <div>
                            <dt class="font-medium text-gray-500">Бренд</dt>
                            <dd class="text-gray-900">
                                {{ product.brand?.name }}
                            </dd>
                        </div>
                        <div>
                            <dt class="font-medium text-gray-500">Создан</dt>
                            <dd class="text-gray-900">
                                {{
                                    new Date(
                                        product.created_at,
                                    ).toLocaleDateString('ru-RU')
                                }}
                            </dd>
                        </div>
                    </dl>
                </UCard>
            </div>
        </div>

        <!-- Если товар не найден -->
        <div v-else class="text-center py-20">
            <UIcon
                name="i-heroicons-question-mark-circle"
                class="w-16 h-16 text-gray-400 mx-auto mb-4"
            />
            <h2 class="text-2xl font-bold text-gray-800 mb-2">
                Товар не найден
            </h2>
            <p class="text-gray-500">Проверьте правильность ссылки</p>
        </div>
    </UContainer>
</template>
