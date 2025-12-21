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
                <PageCard v-for="product in products" :key="product.id">
                    >{{ product.name }} — {{ product.price }} ₽
                </PageCard>
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
