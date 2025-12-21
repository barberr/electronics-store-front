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
                        <UCard
                            v-for="product in products"
                            :key="product.id"
                            class="hover:shadow-xl transition-all duration-300 group"
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
                                            product.brand?.name || 'Без бренда'
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
                                <div class="flex items-center justify-between">
                                    <div
                                        class="text-2xl font-bold text-primary"
                                    >
                                        ${{
                                            parseFloat(product.price).toFixed(2)
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
                    </div>
                </div>
            </PageGrid>

            <p v-else>No products found.</p>
        </UPageSection>
        <UPageHero
            title="Nuxt Starter Template"
            description="A production-ready starter template powered by Nuxt UI. Build beautiful, accessible, and performant applications in minutes, not hours."
            :links="[
                {
                    label: 'Get started',
                    to: 'https://ui.nuxt.com/docs/getting-started/installation/nuxt',
                    target: '_blank',
                    trailingIcon: 'i-lucide-arrow-right',
                    size: 'xl',
                },
                {
                    label: 'Use this template',
                    to: 'https://github.com/nuxt-ui-templates/starter',
                    target: '_blank',
                    icon: 'i-simple-icons-github',
                    size: 'xl',
                    color: 'neutral',
                    variant: 'subtle',
                },
            ]"
        />

        <UPageSection
            id="features"
            title="Everything you need to build modern Nuxt apps222"
            description="Start with a solid foundation. This template includes all the essentials for building production-ready applications with Nuxt UI's powerful component system."
            :features="[
                {
                    icon: 'i-lucide-rocket',
                    title: 'Production-ready from day one',
                    description:
                        'Pre-configured with TypeScript, ESLint, Tailwind CSS, and all the best practices. Focus on building features, not setting up tooling.',
                },
                {
                    icon: 'i-lucide-palette',
                    title: 'Beautiful by default',
                    description:
                        'Leveraging Nuxt UI\'s design system with automatic dark mode, consistent spacing, and polished components that look great out of the box.',
                },
                {
                    icon: 'i-lucide-zap',
                    title: 'Lightning fast',
                    description:
                        'Optimized for performance with SSR/SSG support, automatic code splitting, and edge-ready deployment. Your users will love the speed.',
                },
                {
                    icon: 'i-lucide-blocks',
                    title: '100+ components included',
                    description:
                        'Access Nuxt UI\'s comprehensive component library. From forms to navigation, everything is accessible, responsive, and customizable.',
                },
                {
                    icon: 'i-lucide-code-2',
                    title: 'Developer experience first',
                    description:
                        'Auto-imports, hot module replacement, and TypeScript support. Write less boilerplate and ship more features.',
                },
                {
                    icon: 'i-lucide-shield-check',
                    title: 'Built for scale',
                    description:
                        'Enterprise-ready architecture with proper error handling, SEO optimization, and security best practices built-in.',
                },
            ]"
        />

        <UPageSection>
            <UPageCTA
                title="Ready to build your next Nuxt app?"
                description="Join thousands of developers building with Nuxt and Nuxt UI. Get this template and start shipping today."
                variant="subtle"
                :links="[
                    {
                        label: 'Start building',
                        to: 'https://ui.nuxt.com/docs/getting-started/installation/nuxt',
                        target: '_blank',
                        trailingIcon: 'i-lucide-arrow-right',
                        color: 'neutral',
                    },
                    {
                        label: 'View on GitHub',
                        to: 'https://github.com/nuxt-ui-templates/starter',
                        target: '_blank',
                        icon: 'i-simple-icons-github',
                        color: 'neutral',
                        variant: 'outline',
                    },
                ]"
            />
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
        console.log('prod-', products.value);
        pending.value = false;
    }
};

onMounted(() => {
    fetchProducts();
});
</script>
