<script setup lang="ts">
import { computed, watch, ref } from 'vue';
import { useFormatPrice } from '~/composables/useFormatPrice';

const route = useRoute();
const slug = computed(() => route.params.slug as string);

const product = ref<Product | null>(null);
const pending = ref<boolean>(true);
const error = ref<Error | null>(null);

const api = useApi();

// Обновленные интерфейсы под новое API
// interface ProductImage {
//   id: number
//   image: string
//   alt_text: string
//   order: number
// }

// interface ProductVariant {
//   id: number
//   sku: string | null
//   attributes: Record<string, string>
//   price: string
//   old_price: string | null
//   is_active: boolean
//   stock: number | null
// }

// interface Brand {
//   id: number
//   name: string
//   slug: string
//   logo: string | null
// }

// interface Category {
//   id: number
//   name: string
//   slug: string
// }

// interface Product {
//   id: number
//   name: string
//   slug: string
//   brand: Brand | null
//   category: Category | null
//   short_description: string
//   description: string
//   seo_title: string
//   seo_description: string
//   is_active: boolean
//   is_preorder: boolean
//   delivery_text: string
//   warranty_months: number
//   images: ProductImage[]
//   variants: ProductVariant[]
//   created_at: string
//   updated_at: string
// }

const { formatPrice } = useFormatPrice();

// Вычисляемые свойства
const minPrice = computed(() => {
    const activeVariants =
        product.value?.variants.filter(
            (v) => v.is_active && v.stock !== null && v.stock > 0,
        ) || [];
    return activeVariants.length > 0
        ? Math.min(...activeVariants.map((v) => parseFloat(v.price)))
        : null;
});

const isAvailable = computed(() => {
    return product.value?.is_active && minPrice.value !== null;
});

const availableVariantsCount = computed(() => {
    return (
        product.value?.variants.filter(
            (v) => v.is_active && v.stock !== null && v.stock > 0,
        ).length || 0
    );
});

const selectedVariant = ref<ProductVariant | null>(null);
const expandedVariants = ref(false);

// Группировка вариантов по атрибутам (например, цвет, память)
const variantGroups = computed(() => {
    if (!product.value?.variants.length) return [];

    const groups: Record<string, ProductVariant[]> = {};

    product.value.variants.forEach((variant) => {
        if (!variant.is_active) return;

        const key = Object.entries(variant.attributes)
            .map(([k, v]) => `${k}:${v}`)
            .sort()
            .join('|');

        if (!groups[key]) groups[key] = [];
        groups[key].push(variant);
    });

    return Object.values(groups).filter((g) =>
        g.some((v) => v.stock !== null && v.stock > 0),
    );
});

// Доступные атрибуты для фильтрации (цвет, память и т.д.)
const availableAttributes = computed(() => {
    const attrs: Record<string, string[]> = {};

    product.value?.variants.forEach((variant) => {
        if (!variant.is_active) return;

        Object.entries(variant.attributes).forEach(([key, value]) => {
            if (!attrs[key]) attrs[key] = [];
            if (!attrs[key].includes(value)) attrs[key].push(value);
        });
    });

    return attrs;
});

// Выбор варианта
const selectVariant = (variant: ProductVariant) => {
    selectedVariant.value = variant;
};
const currentImageIndex = ref(0);

// Галерея изображений
const galleryImages = computed(() => {
    return [...(product.value?.images || [])].sort((a, b) => a.order - b.order);
});

// Загрузка товара
const fetchProduct = async () => {
    try {
        const response = await api.get(`/v1/products/${slug.value}/`);
        product.value = response.data;
        selectedVariant.value =
            product.value?.variants.find(
                (v) => v.is_active && v.stock && v.stock > 0,
            ) || null;
    } catch (err: any) {
        error.value = err.response?.data || err;
    } finally {
        pending.value = false;
    }
};

watch(
    () => slug.value,
    () => {
        if (slug.value) fetchProduct();
    },
    { immediate: true },
);

// SEO
useSeoMeta({
    title: () => product.value?.seo_title || product.value?.name || 'Товар',
    description: () =>
        product.value?.seo_description ||
        product.value?.short_description ||
        'Подробности о товаре',
});
</script>

<template>
    <UContainer class="py-12 max-w-7xl">
        <!-- Загрузка -->
        <div v-if="pending" class="flex justify-center py-20">
            <div class="text-center">
                <ULoader size="xl" color="primary" class="mx-auto mb-4" />
                <p class="text-gray-500 dark:text-gray-400">
                    Загружаем товар...
                </p>
            </div>
        </div>

        <!-- Ошибка -->
        <div v-else-if="error" class="text-center py-20">
            <UIcon
                name="i-heroicons-exclamation-triangle"
                class="w-16 h-16 text-red-400 dark:text-red-300 mx-auto mb-4"
            />
            <h2
                class="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2"
            >
                Товар не найден
            </h2>
            <p class="text-gray-500 dark:text-gray-400 mb-6">
                Возможно, товар удален или slug изменился
            </p>
            <UButton @click="fetchProduct" color="primary"
                >Попробовать снова</UButton
            >
        </div>

        <!-- Товар найден -->
        <div v-else-if="product" class="grid lg:grid-cols-2 gap-12 items-start">
            <!-- Изображения -->
            <div class="space-y-6">
                <!-- Главное изображение -->
                <UCard class="overflow-hidden">
                    <div
                        v-if="!galleryImages.length"
                        class="w-full h-96 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center"
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
                        v-else
                        :src="galleryImages[currentImageIndex]?.image"
                        :alt="product.name"
                        class="w-full h-96 object-cover hover:scale-105 transition-transform duration-300 cursor-pointer"
                        sizes="500px"
                        @click="
                            currentImageIndex =
                                (currentImageIndex + 1) % galleryImages.length
                        "
                    />
                </UCard>

                <!-- Галерея миниатюр -->
                <div
                    v-if="galleryImages.length > 1"
                    class="grid grid-cols-5 gap-3"
                >
                    <UCard
                        v-for="(img, index) in galleryImages.slice(0, 5)"
                        :key="img.id"
                        class="overflow-hidden cursor-pointer p-0 hover:shadow-md transition-all border-2"
                        :class="{
                            'ring-2 ring-primary-500 border-primary-500':
                                currentImageIndex === index,
                        }"
                        @click="currentImageIndex = index"
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
                                class="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-gray-900 leading-tight"
                            >
                                {{ product.name }}
                            </h1>
                            <div
                                class="flex items-center gap-3 mt-3 text-sm text-gray-500 dark:text-gray-400"
                            >
                                <NuxtLink
                                    v-if="product.brand"
                                    :to="`/brands/${product.brand.slug}`"
                                    class="font-medium hover:text-primary transition-colors"
                                >
                                    {{ product.brand.name }}
                                </NuxtLink>
                                <UIcon
                                    name="i-heroicons-chevron-right"
                                    class="w-4 h-4 text-gray-400"
                                />
                                <NuxtLink
                                    v-if="product.category"
                                    :to="`/categories/${product.category.slug}`"
                                    class="font-medium hover:text-primary transition-colors"
                                >
                                    {{ product.category.name }}
                                </NuxtLink>
                            </div>
                        </div>
                        <NuxtLink
                            v-if="product.brand?.logo"
                            :to="`/brands/${product.brand.slug}`"
                            class="w-16 h-16 p-3 bg-gray-100 dark:bg-gray-800 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors shrink-0"
                        >
                            <NuxtImg
                                :src="product.brand.logo!"
                                :alt="product.brand.name"
                                class="w-full h-full object-contain"
                            />
                        </NuxtLink>
                    </div>
                </div>

                <!-- Цена, варианты, кнопки -->
                <UCard class="p-6">
                    <div class="space-y-6">
                        <!-- Цена (динамическая для выбранного варианта) -->
                        <div class="space-y-2">
                            <span
                                class="text-sm font-medium text-gray-500 uppercase tracking-wide"
                            >
                                Цена
                            </span>
                            <div class="space-y-1">
                                <div
                                    v-if="selectedVariant && minPrice"
                                    class="text-4xl lg:text-5xl font-bold text-primary-600 dark:text-primary-400"
                                >
                                    {{
                                        formatPrice(
                                            parseFloat(selectedVariant.price),
                                        )
                                    }}
                                </div>
                                <div
                                    v-else-if="minPrice"
                                    class="text-4xl lg:text-5xl font-bold text-primary-600 dark:text-primary-400"
                                >
                                    {{ formatPrice(minPrice) }}
                                </div>
                                <div
                                    v-if="selectedVariant?.old_price"
                                    class="text-xl text-gray-400 dark:text-gray-500 line-through"
                                >
                                    {{
                                        formatPrice(
                                            parseFloat(
                                                selectedVariant.old_price,
                                            ),
                                        )
                                    }}
                                </div>
                            </div>
                        </div>

                        <!-- Выбор вариантов -->
                        <div
                            v-if="product.variants.length > 1"
                            class="space-y-4"
                        >
                            <!-- Атрибуты (цвет, память) -->
                            <div
                                v-if="Object.keys(availableAttributes).length"
                                class="space-y-3"
                            >
                                <h3
                                    class="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2"
                                >
                                    <UIcon
                                        name="i-heroicons-cog-6-tooth"
                                        class="w-5 h-5"
                                    />
                                    Выберите характеристики
                                </h3>

                                <!-- Группы атрибутов -->
                                <div class="space-y-3">
                                    <div
                                        v-for="(
                                            values, attrName
                                        ) in availableAttributes"
                                        :key="attrName"
                                        class="space-y-2"
                                    >
                                        <label
                                            class="text-sm font-medium text-gray-700 dark:text-gray-300 capitalize block mb-1"
                                        >
                                            {{
                                                attrName === 'color'
                                                    ? 'Цвет'
                                                    : attrName === 'memory'
                                                    ? 'Память'
                                                    : attrName
                                            }}
                                        </label>
                                        <div class="flex flex-wrap gap-2">
                                            <UButton
                                                v-for="value in values"
                                                :key="value"
                                                size="sm"
                                                color="gray"
                                                variant="soft"
                                                class="capitalize"
                                                :class="{
                                                    'ring-2 ring-primary-500 bg-primary-100 text-primary-700':
                                                        selectedVariant
                                                            ?.attributes[
                                                            attrName
                                                        ] === value,
                                                }"
                                                @click="() => {}"
                                            >
                                                {{ value }}
                                            </UButton>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- Список вариантов -->
                            <div>
                                <div
                                    class="flex items-center justify-between mb-4"
                                >
                                    <h4
                                        class="text-lg font-semibold text-gray-900 dark:text-gray-100"
                                    >
                                        Доступные варианты ({{
                                            availableVariantsCount
                                        }})
                                    </h4>
                                    <UButton
                                        v-if="product.variants.length > 4"
                                        variant="link"
                                        size="sm"
                                        @click="
                                            expandedVariants = !expandedVariants
                                        "
                                    >
                                        {{
                                            expandedVariants
                                                ? 'Свернуть'
                                                : 'Показать все'
                                        }}
                                        <UIcon
                                            :name="
                                                expandedVariants
                                                    ? 'i-heroicons-chevron-up'
                                                    : 'i-heroicons-chevron-down'
                                            "
                                            class="w-4 h-4 ml-1"
                                        />
                                    </UButton>
                                </div>

                                <!-- Карточки вариантов -->
                                <div
                                    class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3"
                                >
                                    <UCard
                                        v-for="group in variantGroups.slice(
                                            0,
                                            expandedVariants ? undefined : 4,
                                        )"
                                        :key="group[0].id"
                                        class="p-4 hover:shadow-md transition-all cursor-pointer border-2 hover:border-primary-200"
                                        :class="{
                                            'ring-2 ring-primary-500 border-primary-500 bg-primary-50 dark:bg-primary-950/50':
                                                group.some(
                                                    (v) =>
                                                        selectedVariant?.id ===
                                                        v.id,
                                                ),
                                        }"
                                        @click="selectVariant(group[0])"
                                    >
                                        <div class="space-y-2">
                                            <!-- Атрибуты -->
                                            <div
                                                class="flex flex-wrap gap-2 text-xs text-gray-600 dark:text-gray-400"
                                            >
                                                <span
                                                    v-for="(
                                                        value, key
                                                    ) in group[0].attributes"
                                                    :key="key"
                                                    class="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded-full"
                                                >
                                                    {{ key }}: {{ value }}
                                                </span>
                                            </div>

                                            <!-- Цена -->
                                            <div
                                                class="flex items-center justify-between"
                                            >
                                                <span
                                                    class="text-lg font-bold text-gray-900 dark:text-gray-100"
                                                >
                                                    {{
                                                        formatPrice(
                                                            parseFloat(
                                                                group[0].price,
                                                            ),
                                                        )
                                                    }}
                                                </span>
                                                <UBadge
                                                    :color="
                                                        group[0].stock &&
                                                        group[0].stock > 0
                                                            ? 'green'
                                                            : 'gray'
                                                    "
                                                    size="sm"
                                                >
                                                    {{ group[0].stock || 0 }}
                                                    шт.
                                                </UBadge>
                                            </div>

                                            <!-- Артикул -->
                                            <div
                                                v-if="group[0].sku"
                                                class="text-xs text-gray-500 dark:text-gray-400"
                                            >
                                                Арт.: {{ group[0].sku }}
                                            </div>
                                        </div>
                                    </UCard>
                                </div>
                            </div>
                        </div>

                        <!-- Кнопки покупки -->
                        <div class="grid grid-cols-1 lg:grid-cols-2 gap-3">
                            <UButton
                                size="xl"
                                color="primary"
                                :disabled="!isAvailable || !selectedVariant"
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
                                color="neutral"
                                variant="outline"
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

                <!-- Краткое описание -->
                <UCard v-if="product.short_description" class="p-6">
                    <h2
                        class="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4"
                    >
                        {{ product.short_description }}
                    </h2>
                </UCard>

                <!-- Полное описание -->
                <UCard v-if="product.description" class="p-6">
                    <h2
                        class="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2"
                    >
                        <UIcon
                            name="i-heroicons-document-text"
                            class="w-6 h-6 text-gray-500"
                        />
                        Описание
                    </h2>
                    <div class="prose prose-sm max-w-none dark:prose-invert">
                        <div v-html="product.description" />
                    </div>
                </UCard>

                <!-- Дополнительная информация -->
                <UCard class="p-6">
                    <h3
                        class="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6"
                    >
                        Характеристики
                    </h3>
                    <dl class="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                        <div>
                            <dt
                                class="font-medium text-gray-500 dark:text-gray-400 mb-1"
                            >
                                Категория
                            </dt>
                            <dd class="text-gray-900 dark:text-gray-100">
                                {{ product.category?.name }}
                            </dd>
                        </div>
                        <div>
                            <dt
                                class="font-medium text-gray-500 dark:text-gray-400 mb-1"
                            >
                                Бренд
                            </dt>
                            <dd class="text-gray-900 dark:text-gray-100">
                                {{ product.brand?.name }}
                            </dd>
                        </div>
                        <div>
                            <dt
                                class="font-medium text-gray-500 dark:text-gray-400 mb-1"
                            >
                                Гарантия
                            </dt>
                            <dd class="text-gray-900 dark:text-gray-100">
                                {{ product.warranty_months }} месяцев
                            </dd>
                        </div>
                        <div>
                            <dt
                                class="font-medium text-gray-500 dark:text-gray-400 mb-1"
                            >
                                Создан
                            </dt>
                            <dd class="text-gray-900 dark:text-gray-100">
                                {{
                                    new Date(
                                        product.created_at,
                                    ).toLocaleDateString('ru-RU')
                                }}
                            </dd>
                        </div>
                    </dl>
                </UCard>

                <!-- Доставка -->
                <UCard v-if="product.delivery_text" class="p-6">
                    <h3
                        class="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2"
                    >
                        <UIcon
                            name="i-heroicons-truck"
                            class="w-6 h-6 text-gray-500"
                        />
                        Доставка
                    </h3>
                    <p class="text-gray-700 dark:text-gray-300">
                        {{ product.delivery_text }}
                    </p>
                </UCard>
            </div>
        </div>
    </UContainer>
</template>
