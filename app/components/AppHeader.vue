<template>
    <header class="header">
        <div class="w-full flex">
            <div class="header__logo min-w-64 px-4">
                <NuxtLink to="/">
                    <h1>Техника от Боряна</h1>
                </NuxtLink>
            </div>

            <div class="flex items-center justify-center w-full">
                <div class="flex items-center justify-center gap-x-8">
                    <div class="nav-item">
                        <UInputTags size="xl" placeholder="Поиск..." />
                    </div>
                    <div class="nav-item">
                        <NuxtLink to="/" class="nav-link"
                            >Адрес головного офиса...</NuxtLink
                        >
                    </div>
                    <div class="nav-item">
                        <a href="tel:+74951234567"
                            >Позвонить: +7 (495) 123-45-67</a
                        >
                    </div>
                    <ul class="header__social flex">
                        <li>
                            <TelegramIconLink
                                href="https://t.me/vuejs_ru"
                                size="xs"
                            />
                        </li>
                    </ul>
                    <div class="header__controls flex gap-x-2">
                        <!-- <button to="/" class="nav-link">
                            <font-awesome-icon
                                icon="bookmark"
                                class="inline-block w-5 h-5 align-middle"
                            />
                            Избранное
                        </button> -->
                        <UButton
                            size="xl"
                            icon="i-lucide-bookmark"
                            color="neutral"
                            variant="ghost"
                            >Избранное</UButton
                        >

                        <UButton
                            size="xl"
                            icon="i-lucide-user"
                            color="neutral"
                            variant="ghost"
                            >Войти</UButton
                        >
                        <!-- <font-awesome-icon
                                icon="user"
                                class="inline-block w-5 h-5 align-middle"
                            /> -->
                    </div>
                    <UDropdownMenu
                        size="md"
                        :items="items"
                        :ui="{
                            content: 'w-48',
                        }"
                    >
                        <UButton
                            size="xl"
                            icon="i-lucide-pen"
                            color="neutral"
                            variant="outline"
                        />
                    </UDropdownMenu>
                </div>
            </div>
        </div>
    </header>
    <UHeader
        title="Категории товаров"
        class="container hidden md:flex items-center space-x-1 relative"
    >
        <div
            v-for="category in categories"
            :key="category.id"
            class="relative"
            @mouseenter="openDropdown(category.id)"
            @mouseleave="closeDropdown"
        >
            <!-- Кнопка категории -->
            <UButton
                variant="ghost"
                class="px-4 py-2 text-gray-700 hover:text-primary-600 hover:bg-gray-50"
            >
                {{ category.name }}
                <UIcon
                    name="i-mdi-chevron-down"
                    class="ml-1 h-4 w-4 transition-transform duration-200"
                    :class="{
                        'rotate-180': activeDropdown === category.id,
                    }"
                />
            </UButton>
        </div>
    </UHeader>
</template>

<script setup lang="ts">
import type { DropdownMenuItem } from '@nuxt/ui';
import useApi from '~/composables/useApi';

const categories = ref<any[]>([]);
const pending = ref<boolean>(true);
const error = ref<Error | null>(null);

const activeDropdown = ref<number | null>(null);

// Функция загрузки

const fetchCategories = async () => {
    const api = useApi();
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
        const res = await $fetch(`/api/categories/${categoryId}/products/`);
        // или через axios:
        // const res = await axios.get(`/api/categories/${categoryId}/products/`)
        categories.value = categories.value.map((cat) =>
            cat.id === categoryId ? { ...cat, products: res } : cat,
        );
    } catch (err) {
        console.error('Failed to load products', err);
    }
};

// в openDropdown
const openDropdown = async (id: number) => {
    if (!categories.value.find((c) => c.id === id)?.products) {
        await loadProducts(id);
    }
    activeDropdown.value = id;
};

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
