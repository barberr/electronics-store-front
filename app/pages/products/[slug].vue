<script setup lang="ts">
import { computed, watch, ref } from 'vue';
import { useFormatPrice } from '~/composables/useFormatPrice';


const route = useRoute();
const slug = computed(() => route.params.slug as string);

const product = ref<Product | null>(null);
const pending = ref<boolean>(true);
const error = ref<Error | null>(null);

const api = useApi();
const cart = useCart();
const { formatPrice } = useFormatPrice();

onMounted(() => {
  if (!cart.cart.value) {
    cart.fetchCart();
  }
  console.log('Cart -', cart);
});

// Вычисляемые свойства
const minPrice = computed(() => {
    const activeVariants =
        product.value?.variants.filter(
            (v) => v.is_active && v.stock !== null,
        ) || [];
    return activeVariants.length > 0
        ? Math.min(...activeVariants.map((v) => parseFloat(v.price)))
        : null;
});

const isAvailable = computed(() => {
    return product.value?.is_active;
});

const availableVariantsCount = computed(() => {
    return (
        product.value?.variants.filter(
            (v) => v.is_active && v.stock !== null,
        ).length || 0
    );
});

const selectedAttributes = ref<Record<string, string>>({});
const expandedVariants = ref(false);

const fallbackAttributeLabels: Record<string, string> = {
    color: 'Цвет',
    memory: 'Память',
    storage: 'Память',
};

const attributeMeta = computed(() => {
    const meta: Record<string, { name: string; unit?: string }> = {};

    product.value?.variants.forEach((variant) => {
        variant.attribute_values?.forEach((attribute) => {
            meta[attribute.slug] = {
                name: attribute.name,
                unit: attribute.unit || undefined,
            };
        });
    });

    return meta;
});

const productSpecifications = computed(() => product.value?.specifications || []);

const getAttributeLabel = (slug: string) => {
    return attributeMeta.value[slug]?.name || fallbackAttributeLabels[slug] || slug;
};

const formatPropertyValue = (value: string | number | null | undefined, unit?: string) => {
    if (value === null || value === undefined || value === '') return 'Не указано';
    if (!unit) return String(value);

    const normalizedValue = String(value);
    return normalizedValue.endsWith(unit) ? normalizedValue : `${normalizedValue} ${unit}`;
};

const getVariantDisplayAttributes = (variant: ProductVariant) => {
    if (variant.attribute_values?.length) {
        return variant.attribute_values.map(attribute => ({
            key: attribute.slug,
            label: attribute.name,
            value: formatPropertyValue(attribute.value, attribute.unit),
        }));
    }

    return Object.entries(variant.attributes).map(([key, value]) => ({
        key,
        label: getAttributeLabel(key),
        value,
    }));
};

// Вычисляемый выбранный вариант
const selectedVariant = computed(() => {
    if (!product.value?.variants.length) return null;
    
    const matchingVariant = product.value.variants.find(variant => {
        if (!variant.is_active) return false;
        
        return Object.entries(selectedAttributes.value).every(([attrName, attrValue]) => {
            return variant.attributes[attrName] === attrValue;
        });
    });
    
    return matchingVariant || null;
});

// Группировка вариантов
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
        g.some((v) => v.stock !== null),
    );
});

const variantCards = computed(() => {
    return variantGroups.value
        .map((group) => group[0])
        .filter((variant): variant is ProductVariant => Boolean(variant));
});

// Доступные атрибуты
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

const selectAttribute = (attrName: string, value: string) => {
    selectedAttributes.value = {
        ...selectedAttributes.value,
        [attrName]: value
    };
    
    if (variantGroups.value.length > 3) {
        expandedVariants.value = true;
    }
};

const currentImageIndex = ref(0);
const galleryImages = computed(() => {
    return [...(product.value?.images || [])].sort((a, b) => a.order - b.order);
});

// Загрузка товара - ИСПРАВЛЕНО!
const fetchProduct = async () => {
    try {
        const response = await api.get(`/v1/products/${slug.value}/`);
        product.value = response.data;
        
        // Устанавливаем начальные атрибуты первого доступного варианта
        const firstAvailable = product.value?.variants.find(
            (v) => v.is_active && v.stock !== null,
        );
        if (firstAvailable) {
            selectedAttributes.value = { ...firstAvailable.attributes };
        }
    } catch (err: any) {
        error.value = err.response?.data || err;
    } finally {
        pending.value = false;
    }
};

watch(slug, (newSlug, oldSlug) => {
  if (newSlug && newSlug !== oldSlug) {
    fetchProduct();
  }
}, { immediate: true });

useSeoMeta({
    title: () => product.value?.seo_title || product.value?.name || 'Товар',
    description: () =>
        product.value?.seo_description ||
        product.value?.short_description ||
        'Подробности о товаре',
});

const addToCartHandler = async () => {
    if (!selectedVariant.value) {
        console.warn('Нет выбранного варианта');
        return;
    }
    await cart.addToCart(selectedVariant.value.id, 1);
};

const selectAttributeFromVariant = (variant: ProductVariant) => {
    selectedAttributes.value = { ...variant.attributes };
};
</script>

<template>
    <UContainer class="py-12 max-w-7xl">
        <!-- Загрузка -->
        <div v-if="pending" class="flex justify-center py-20">
            <div class="text-center">
                <!-- <ULoader size="xl" color="primary" class="mx-auto mb-4" /> -->
                <p class="text-text-400">
                    Загружаем товар...
                </p>
            </div>
        </div>

        <!-- Ошибка -->
        <div v-else-if="error" class="text-center py-20">
            <UIcon
                name="i-heroicons-exclamation-triangle"
                class="w-16 h-16 text-text-400 mx-auto mb-4"
            />
            <h2
                class="text-2xl font-bold text-text-100 mb-2"
            >
                Товар не найден
            </h2>
            <p class="text-text-400 mb-6">
                Возможно, товар удален или slug изменился
            </p>
            <UButton @click="fetchProduct" color="primary"
                >Попробовать снова</UButton
            >
        </div>

        <!-- Товар найден -->
        <div v-else-if="product" class="grid lg:grid-cols-2 gap-6 md:gap-8 xl:gap-12 items-start">
            <!-- Изображения -->
            <div class="space-y-4 md:space-y-6 lg:sticky lg:top-8">
                <!-- Главное изображение -->
                <UCard class="overflow-hidden border border-surface-900 bg-[linear-gradient(180deg,color-mix(in_srgb,var(--color-surface-900)_28%,transparent)_0%,transparent_100%)] shadow-xl md:shadow-2xl rounded-[1.5rem] md:rounded-[2rem]">
                    <div
                        v-if="!galleryImages.length"
                        class="w-full h-[18rem] md:h-96 bg-gradient-to-br from-surface-900 to-surface-700 flex items-center justify-center"
                    >
                        <div class="text-center">
                            <UIcon
                                name="i-heroicons-camera"
                                class="w-20 h-20 text-text-400 mx-auto mb-2"
                            />
                            <p class="text-text-400">
                                Изображение появится позже
                            </p>
                        </div>
                    </div>
                    <NuxtImg
                        v-else
                        :src="galleryImages[currentImageIndex]?.image"
                        :alt="product.name"
                        class="w-full h-[18rem] md:h-96 object-contain p-4 md:p-6 hover:scale-105 transition-transform duration-300 cursor-pointer"
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
                    class="flex gap-2 overflow-x-auto pb-1 md:grid md:grid-cols-5 md:gap-3"
                >
                    <UCard
                        v-for="(img, index) in galleryImages.slice(0, 5)"
                        :key="img.id"
                        class="overflow-hidden cursor-pointer p-0 hover:shadow-md transition-all border-2 bg-[color:color-mix(in_srgb,var(--color-bg-950)_84%,var(--color-surface-900))] shrink-0 w-16 md:w-auto rounded-2xl"
                        :class="{
                            'ring-2 ring-text-100 border-text-100':
                                currentImageIndex === index,
                            'border-surface-900':
                                currentImageIndex !== index,
                        }"
                        @click="currentImageIndex = index"
                    >
                        <NuxtImg
                            :src="img.image"
                            :alt="`${product.name} - изображение ${index + 1}`"
                            class="w-full h-16 md:h-20 object-contain p-1"
                            sizes="100px"
                        />
                    </UCard>
                </div>
            </div>

            <!-- Информация о товаре -->
            <div class="space-y-5 md:space-y-8">
                <!-- Заголовок и бренд -->
                <div class="space-y-3 rounded-[1.5rem] md:rounded-[1.75rem] border border-surface-900 bg-[linear-gradient(180deg,color-mix(in_srgb,var(--color-surface-900)_20%,transparent)_0%,transparent_100%)] p-4 md:p-6 shadow-xl">
                    <div class="flex items-start justify-between gap-3 md:gap-4 mb-2 md:mb-4">
                        <div>
                            <h1
                                class="text-2xl md:text-3xl lg:text-4xl font-bold text-text-900 leading-tight"
                            >
                                {{ product.name }}
                            </h1>
                            <div
                                class="flex flex-wrap items-center gap-x-3 gap-y-2 mt-3 text-xs md:text-sm text-text-100"
                            >
                                <NuxtLink
                                    v-if="product.brand"
                                    :to="`/brand/${product.brand.slug}`"
                                    class="font-medium hover:text-text-400 transition-colors"
                                >
                                    {{ product.brand.name }}
                                </NuxtLink>
                                <UIcon
                                    name="i-heroicons-chevron-right"
                                    class="w-4 h-4 text-text-100"
                                />
                                <NuxtLink
                                    v-if="product.category"
                                    :to="`/categories/${product.category.slug}`"
                                    class="font-medium hover:text-text-400 transition-colors"
                                >
                                    {{ product.category.name }}
                                </NuxtLink>
                            </div>
                        </div>
                        <NuxtLink
                            v-if="product.brand?.logo"
                            :to="`/brand/${product.brand.slug}`"
                            class="w-12 h-12 md:w-16 md:h-16 p-2 md:p-3 bg-surface-900 rounded-2xl hover:bg-surface-700 transition-colors shrink-0 border border-surface-700"
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
                <UCard class="p-4 md:p-6 border border-surface-900 bg-[linear-gradient(180deg,color-mix(in_srgb,var(--color-surface-900)_22%,transparent)_0%,transparent_100%)] shadow-2xl rounded-[1.5rem] md:rounded-[1.75rem]">
                    <div class="space-y-5 md:space-y-6">
                        <!-- Цена (динамическая для выбранного варианта) -->
                        <div class="space-y-2">
                            <span
                                class="text-sm font-medium text-text-400 uppercase tracking-wide"
                            >
                                Цена
                            </span>
                            <div class="space-y-1">
                                <div v-if="selectedVariant" 
                                    class="text-3xl md:text-4xl lg:text-5xl font-bold text-text-100">
                                    {{ formatPrice(parseFloat(selectedVariant.price)) }}
                                </div>
                                <div
                                    v-else-if="minPrice"
                                    class="text-3xl md:text-4xl lg:text-5xl font-bold text-text-100"
                                >
                                    {{ formatPrice(minPrice) }}
                                </div>
                                <div
                                    v-if="selectedVariant?.old_price"
                                    class="text-lg md:text-xl text-text-400 line-through"
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
                            class="space-y-4 md:space-y-5"
                        >
                            <!-- Атрибуты (цвет, память) -->
                            <div
                                v-if="Object.keys(availableAttributes).length"
                                class="space-y-4 rounded-[1.25rem] border border-surface-900 bg-[linear-gradient(180deg,color-mix(in_srgb,var(--color-surface-900)_20%,transparent)_0%,transparent_100%)] p-4 md:p-5"
                            >
                                <div class="flex flex-col gap-1 md:flex-row md:items-start md:justify-between">
                                    <div>
                                        <h3
                                            class="text-base md:text-lg font-semibold text-text-100 flex items-center gap-2"
                                        >
                                            <UIcon
                                                name="i-heroicons-cog-6-tooth"
                                                class="w-5 h-5 text-text-400"
                                            />
                                            Выберите характеристики
                                        </h3>
                                        <p class="mt-1 text-xs md:text-sm text-text-400">
                                            Сначала выберите нужные параметры, затем подтвердите вариант ниже.
                                        </p>
                                    </div>
                                    <div class="hidden md:flex items-center rounded-full border border-surface-700 bg-bg-950/70 px-3 py-1 text-[11px] uppercase tracking-[0.14em] text-text-400">
                                        Шаг 1
                                    </div>
                                </div>

                                <!-- Группы атрибутов -->
                                <div class="space-y-3 md:space-y-4">
                                    <div
                                        v-for="(values, attrName) in availableAttributes"
                                        :key="attrName"
                                        class="space-y-2.5"
                                    >
                                        <div class="flex items-center gap-2">
                                            <span class="inline-flex h-2 w-2 rounded-full bg-text-400" />
                                            <label
                                                class="text-sm font-medium text-text-100 capitalize block"
                                            >
                                                {{ getAttributeLabel(attrName) }}
                                            </label>
                                        </div>
                                        <div class="flex flex-wrap gap-2">
                                            <UButton
                                                v-for="value in values"
                                                :key="value"
                                                size="sm"
                                                color="neutral"
                                                variant="soft"
                                                class="capitalize rounded-full px-3 min-h-9 border border-surface-700/80"
                                                @click="selectAttribute(attrName, value)"
                                                :class="{
                                                    'ring-2 ring-text-100 border-text-100 bg-surface-900 text-text-100 shadow-[0_8px_24px_rgb(0_0_0_/_0.18)]':
                                                        selectedAttributes[attrName] === value,
                                                }"
                                            >
                                                {{ value }}
                                            </UButton>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- Список вариантов -->
                            <div>
                                <div class="flex items-center justify-between gap-3 mb-3 md:mb-4">
                                    <h4
                                        class="text-base md:text-lg font-semibold text-text-100"
                                    >
                                        Доступные варианты ({{ availableVariantsCount }})
                                    </h4>
                                    <UButton
                                        v-if="product.variants.length > 3"
                                        variant="link"
                                        size="sm"
                                        @click="expandedVariants = !expandedVariants"
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
                                <div class="grid grid-cols-1 gap-2.5 md:grid-cols-2 lg:grid-cols-3 md:gap-3">
                                    <UCard
                                        v-for="variant in variantCards.slice(
                                            0,
                                            expandedVariants ? undefined : 3,
                                        )"
                                        :key="variant.id"
                                        class="h-full hover:shadow-lg transition-all cursor-pointer border-2 border-surface-900 hover:border-surface-700 bg-[linear-gradient(180deg,color-mix(in_srgb,var(--color-surface-900)_18%,transparent)_0%,transparent_100%)] rounded-2xl md:rounded-[1.25rem]"
                                        :class="{
                                            'ring-2 ring-text-100 border-text-100 bg-[linear-gradient(180deg,rgb(70_70_70_/_0.38)_0%,rgb(70_70_70_/_0.16)_100%)] shadow-[0_18px_40px_rgb(0_0_0_/_0.2)]':
                                                selectedVariant && selectedVariant.id === variant.id,
                                        }"
                                        @click="selectAttributeFromVariant(variant)"
                                    >
                                        <div class="flex h-full flex-col gap-2.5">
                                            <!-- Атрибуты -->
                                            <div
                                                class="flex flex-wrap gap-1.5 text-[11px] md:text-xs text-text-400 min-h-[2rem]"
                                            >
                                                <span
                                                    v-for="attribute in getVariantDisplayAttributes(variant)"
                                                    :key="attribute.key"
                                                    class="px-2 py-1 bg-surface-900 rounded-2xl md:rounded-[1.25rem] border border-surface-700"
                                                >
                                                    {{ attribute.label }}: {{ attribute.value }}
                                                </span>
                                            </div>

                                            <!-- Цена -->
                                            <div
                                                class="flex items-start justify-between gap-2 pt-0.5"
                                            >
                                                <div class="flex min-w-0 flex-col gap-1">
                                                    <span
                                                        class="text-[15px] md:text-base lg:text-[0.95rem] font-bold text-text-100 leading-tight break-words"
                                                    >
                                                        {{
                                                            formatPrice(
                                                                parseFloat(
                                                                    variant.price,
                                                                ),
                                                            )
                                                        }}
                                                    </span>
                                                    <div
                                                        v-if="variant.sku"
                                                        class="text-[11px] md:text-xs text-text-400"
                                                    >
                                                        Арт.: {{ variant.sku }}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </UCard>
                                </div>
                            </div>
                        </div>

                        <!-- Кнопки покупки -->
                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                            <UButton
                                size="xl"
                                color="primary"
                                :disabled="!isAvailable || !selectedVariant"
                                class="buy-cta text-base md:text-lg font-semibold h-12 md:h-14 rounded-2xl order-1"
                                @click="addToCartHandler"
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
                                class="text-base md:text-lg font-semibold h-12 md:h-14 rounded-2xl order-2"
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
                <UCard v-if="product.short_description" class="p-4 md:p-6 border border-surface-900 bg-[linear-gradient(180deg,color-mix(in_srgb,var(--color-surface-900)_16%,transparent)_0%,transparent_100%)] rounded-[1.5rem]">
                    <h2
                        class="text-lg md:text-xl font-semibold text-text-100 mb-3 md:mb-4"
                    >
                        {{ product.short_description }}
                    </h2>
                </UCard>

                <!-- Полное описание -->
                <UCard v-if="product.description" class="p-4 md:p-6 border border-surface-900 bg-[linear-gradient(180deg,color-mix(in_srgb,var(--color-surface-900)_16%,transparent)_0%,transparent_100%)] rounded-[1.5rem]">
                    <h2
                        class="text-lg md:text-xl font-semibold text-text-100 mb-3 md:mb-4 flex items-center gap-2"
                    >
                        <UIcon
                            name="i-heroicons-document-text"
                            class="w-6 h-6 text-text-400"
                        />
                        Описание
                    </h2>
                    <div class="prose prose-sm prose-invert max-w-none">
                        <div v-html="product.description" />
                    </div>
                </UCard>

                <!-- Дополнительная информация -->
                <UCard class="p-4 md:p-6 border border-surface-900 bg-[linear-gradient(180deg,color-mix(in_srgb,var(--color-surface-900)_16%,transparent)_0%,transparent_100%)] rounded-[1.5rem]">
                    <h3
                        class="text-lg md:text-xl font-semibold text-text-100 mb-4 md:mb-6"
                    >
                        Характеристики
                    </h3>
                    <dl class="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 text-sm">
                        <div>
                            <dt
                                class="font-medium text-text-400 mb-1"
                            >
                                Категория
                            </dt>
                            <dd class="text-text-100">
                                {{ product.category?.name }}
                            </dd>
                        </div>
                        <div>
                            <dt
                                class="font-medium text-text-400 mb-1"
                            >
                                Бренд
                            </dt>
                            <dd class="text-text-100">
                                {{ product.brand?.name }}
                            </dd>
                        </div>
                        <div>
                            <dt
                                class="font-medium text-text-400 mb-1"
                            >
                                Гарантия
                            </dt>
                            <dd class="text-text-100">
                                {{ product.warranty_months }} месяцев
                            </dd>
                        </div>
                        <div v-if="productSpecifications.length">
                            <dt
                                class="font-medium text-text-400 mb-1"
                            >
                                Характеристик
                            </dt>
                            <dd class="text-text-100">
                                {{ productSpecifications.length }}
                            </dd>
                        </div>
                        <div>
                            <dt
                                class="font-medium text-text-400 mb-1"
                            >
                                Создан
                            </dt>
                            <dd class="text-text-100">
                                {{
                                    new Date(
                                        product.created_at,
                                    ).toLocaleDateString('ru-RU')
                                }}
                            </dd>
                        </div>
                        <template
                            v-for="specification in productSpecifications"
                            :key="specification.id"
                        >
                            <div>
                                <dt
                                    class="font-medium text-text-400 mb-1"
                                >
                                    {{ specification.name }}
                                </dt>
                                <dd class="text-text-100">
                                    {{ formatPropertyValue(specification.value, specification.unit) }}
                                </dd>
                            </div>
                        </template>
                    </dl>
                </UCard>

                <!-- Доставка -->
                <UCard v-if="product.delivery_text" class="p-4 md:p-6 border border-surface-900 bg-[linear-gradient(180deg,color-mix(in_srgb,var(--color-surface-900)_16%,transparent)_0%,transparent_100%)] rounded-[1.5rem]">
                    <h3
                        class="text-lg md:text-xl font-semibold text-text-100 mb-3 md:mb-4 flex items-center gap-2"
                    >
                        <UIcon
                            name="i-heroicons-truck"
                            class="w-6 h-6 text-text-400"
                        />
                        Доставка
                    </h3>
                    <p class="text-text-400">
                        {{ product.delivery_text }}
                    </p>
                </UCard>
            </div>
        </div>
    </UContainer>
</template>
