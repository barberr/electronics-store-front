<template>
    <!-- Основной хедер -->
    <header class="header">
        <div
            class="container mx-auto px-4 flex items-center justify-between h-16"
        >
            <!-- Логотип -->
            <div class="header__logo min-w-[160px]">
                <NuxtLink to="/" class="block">
                    <h1 class="text-xl font-bold">Техника от Боряна</h1>
                </NuxtLink>
            </div>

            <!-- Мобильное меню -->
            <div class="md:hidden">
                <UButton
                    color="white"
                    variant="ghost"
                    icon="i-heroicons-bars-3"
                    square
                    @click="mobileMenu.open = true"
                />
            </div>

            <!-- Десктоп навигация (скрыта на мобильных) -->
            <div
                class="hidden md:flex items-center justify-center w-full gap-6"
            >
                <!-- Поиск -->
                <UInputTags
                    size="lg"
                    placeholder="Поиск..."
                    class="w-64 max-w-sm"
                />

                <!-- Контакты -->
                <div class="flex items-center gap-4 text-sm">
                    <NuxtLink
                        to="/"
                        class="text-white/90 hover:text-white transition-colors"
                    >
                        Адрес офиса
                    </NuxtLink>
                    <a
                        href="tel:+74951234567"
                        class="text-white/90 hover:text-white transition-colors"
                    >
                        +7 (495) 123-45-67
                    </a>
                </div>

                <!-- Соцсети -->
                <ul class="header__social flex items-center gap-2">
                    <li>
                        <TelegramIconLink
                            href="https://t.me/vuejs_ru"
                            size="sm"
                        />
                    </li>
                </ul>

                <!-- Кнопки -->
                <div class="flex items-center gap-2">
                    <UButton
                        size="lg"
                        icon="i-lucide-bookmark"
                        color="white-alpha"
                        variant="ghost"
                    >
                        Избранное
                    </UButton>
                    <UButton
                        size="lg"
                        icon="i-lucide-user"
                        color="white-alpha"
                        variant="ghost"
                    >
                        Войти
                    </UButton>
                    <UDropdownMenu :items="items">
                        <UButton
                            size="lg"
                            icon="i-lucide-menu"
                            color="white-alpha"
                            variant="outline"
                        />
                    </UDropdownMenu>
                </div>
            </div>
        </div>
    </header>

    <!-- Категории (только десктоп) -->
    <UHeader
        title="Категории товаров"
        class="container mx-auto px-4 hidden lg:flex items-center space-x-1 relative"
    >
        <div
            v-for="category in categories"
            :key="category.id"
            class="relative"
            @mouseenter="openDropdown(category.id)"
            @mouseleave="closeDropdown"
        >
            <UButton
                variant="ghost"
                class="px-4 py-2 text-gray-700 hover:text-primary-600 hover:bg-gray-50"
            >
                {{ category.name }}
                <UIcon
                    name="i-mdi-chevron-down"
                    class="ml-1 h-4 w-4 transition-transform duration-200"
                    :class="{ 'rotate-180': activeDropdown === category.id }"
                />
            </UButton>
        </div>
    </UHeader>

    <!-- Мобильное боковое меню -->
    <USlideover v-model="mobileMenu.open" side="right" class="md:hidden">
        <template #default>
            <div class="p-6 space-y-6">
                <!-- Поиск -->
                <UInputTags
                    v-model="searchQuery"
                    size="lg"
                    placeholder="Поиск товаров..."
                    class="w-full"
                />

                <!-- Категории -->
                <UCollapsibleGroup class="space-y-2">
                    <UCollapsible
                        v-for="category in categories"
                        :key="category.id"
                        :open="mobileMenu.activeCategory === category.id"
                        @open-change="
                            (isOpen) =>
                                (mobileMenu.activeCategory = isOpen
                                    ? category.id
                                    : null)
                        "
                    >
                        <template #trigger="{ open }">
                            <div
                                class="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50"
                            >
                                <span class="font-medium">{{
                                    category.name
                                }}</span>
                                <UIcon
                                    :name="
                                        open
                                            ? 'i-heroicons-minus'
                                            : 'i-heroicons-plus'
                                    "
                                    class="w-5 h-5"
                                />
                            </div>
                        </template>
                        <div class="pt-2 space-y-2">
                            <NuxtLink
                                v-for="product in category.products"
                                :key="product.id"
                                :to="`/products/${product.slug}`"
                                class="block p-3 text-sm rounded-lg hover:bg-gray-100"
                            >
                                {{ product.name }}
                            </NuxtLink>
                        </div>
                    </UCollapsible>
                </UCollapsibleGroup>

                <!-- Контакты и кнопки -->
                <div class="pt-4 border-t space-y-4">
                    <div class="space-y-2 text-sm text-gray-600">
                        <NuxtLink to="/" class="block hover:text-primary"
                            >Адрес офиса</NuxtLink
                        >
                        <a
                            href="tel:+74951234567"
                            class="block hover:text-primary"
                        >
                            +7 (495) 123-45-67
                        </a>
                    </div>

                    <div class="flex gap-2 pt-4">
                        <UButton
                            block
                            size="lg"
                            color="primary"
                            icon="i-lucide-shopping-cart"
                        >
                            Корзина
                        </UButton>
                        <UButton block size="lg" color="gray" variant="ghost">
                            Войти
                        </UButton>
                    </div>
                </div>
            </div>
        </template>
    </USlideover>
</template>

<script setup lang="ts">
const categories = ref<any[]>([]);
const activeDropdown = ref<number | null>(null);
const searchQuery = ref('');
const api = useApi();

// Мобильное меню
const mobileMenu = ref({
    open: false,
    activeCategory: null as number | null,
});

const openDropdown = async (id: number) => {
    if (!categories.value.find((c) => c.id === id)?.products) {
        await loadProducts(id);
    }
    activeDropdown.value = id;
};

const closeDropdown = () => {
    activeDropdown.value = null;
};

const fetchCategories = async () => {
    try {
        const response = await api.get('/categories/');
        console.log('response -', response);
        categories.value = response.data.results;
    } catch (err: any) {
        error.value = err.response?.data || err;
        console.error('Failed to fetch products:', err);
    } finally {
        console.log('prod-', categories.value);
        pending.value = false;
    }
};

const loadProducts = async (categoryId: number) => {
    try {
        // const res = await $fetch(`/api/v1/categories/${categoryId}/products/`);
        // или через axios:

        const res = await api.get(`/categories/${categoryId}/products/`);
        categories.value = categories.value.map((cat) =>
            cat.id === categoryId ? { ...cat, products: res } : cat,
        );
    } catch (err) {
        console.error('Failed to load products', err);
    }
};

// в openDropdown
// const openDropdown = async (id: number) => {
//     if (!categories.value.find((c) => c.id === id)?.products) {
//         await loadProducts(id);
//     }
//     activeDropdown.value = id;
// };

onMounted(() => {
    fetchCategories();
});

const items = ref<DropdownMenuItem[][]>([
    [
        {
            label: 'Benjamin',
            avatar: {
                src: 'https://github.com/benjamincanac.png',
            },
            type: 'label',
        },
    ],
    [
        {
            label: 'Profile',
            icon: 'i-lucide-user',
        },
        {
            label: 'Billing',
            icon: 'i-lucide-credit-card',
        },
        {
            label: 'Settings',
            icon: 'i-lucide-cog',
            kbds: [','],
        },
        {
            label: 'Keyboard shortcuts',
            icon: 'i-lucide-monitor',
        },
    ],
    [
        {
            label: 'Team',
            icon: 'i-lucide-users',
        },
        {
            label: 'Invite users',
            icon: 'i-lucide-user-plus',
            children: [
                [
                    {
                        label: 'Email',
                        icon: 'i-lucide-mail',
                    },
                    {
                        label: 'Message',
                        icon: 'i-lucide-message-square',
                    },
                ],
                [
                    {
                        label: 'More',
                        icon: 'i-lucide-circle-plus',
                    },
                ],
            ],
        },
        {
            label: 'New team',
            icon: 'i-lucide-plus',
            kbds: ['meta', 'n'],
        },
    ],
    [
        {
            label: 'GitHub',
            icon: 'i-simple-icons-github',
            to: 'https://github.com/nuxt/ui',
            target: '_blank',
        },
        {
            label: 'Support',
            icon: 'i-lucide-life-buoy',
            to: '/components/dropdown-menu',
        },
        {
            label: 'API',
            icon: 'i-lucide-cloud',
            disabled: true,
        },
    ],
    [
        {
            label: 'Logout',
            icon: 'i-lucide-log-out',
            kbds: ['shift', 'meta', 'q'],
        },
    ],
]);
</script>

<style scoped>
.header {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 1rem 0;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 1rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.header__logo h1 {
    font-size: 1.5rem;
    font-weight: 700;
}

.header__logo a {
    color: white;
    text-decoration: none;
}

.nav-list {
    display: flex;
    list-style: none;
    gap: 2rem;
}

.nav-link {
    color: white;
    text-decoration: none;
    font-weight: 500;
    padding: 0.5rem 0;
    position: relative;
    transition: color 0.3s ease;
}

.nav-link:hover {
    color: #e2e8f0;
}

.nav-link.router-link-active {
    /* border-bottom: 2px solid white; */
}
</style>
