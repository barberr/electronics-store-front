<template>
    <header class="es-header border-b border-gray-200 bg-white">
        <!-- Основной ряд: mobile first -->
        <div class="es-container flex items-center justify-between h-14">
            <!-- Левая зона: бургер + логотип -->
            <div class="flex items-center gap-3">
                <!-- Бургер только на мобильных -->
                <UButton
                    class="md:hidden"
                    icon="i-heroicons-bars-3"
                    color="gray"
                    variant="ghost"
                    square
                    @click="mobileMenu.open = true"
                />

                <!-- Логотип + текст -->
                <NuxtLink to="/" class="flex items-center gap-2">
                    <img
                        src="/logo-electronics-store.svg"
                        alt="Electronics Store"
                        class="es-logo__img w-8 h-8"
                    />
                    <span
                        class="es-logo__title text-sm font-semibold tracking-wide uppercase"
                    >
                        electronics store
                    </span>
                </NuxtLink>
            </div>

            <!-- Центральная зона: поиск (по умолчанию только иконка) -->
            <div class="flex items-center justify-center flex-1 px-2 md:px-4">
                <!-- Иконка поиска на мобильных -->
                <UButton
                    class="md:hidden"
                    icon="i-heroicons-magnifying-glass-20-solid"
                    color="gray"
                    variant="ghost"
                    square
                    @click="mobileMenu.searchOpen = true"
                />

                <!-- Поле поиска на md+ -->
                <div class="hidden md:flex w-full max-w-md">
                    <UInput
                        v-model="searchQuery"
                        size="md"
                        icon="i-heroicons-magnifying-glass-20-solid"
                        placeholder="Поиск по каталогу"
                        class="w-full"
                    />
                </div>
            </div>

            <!-- Правая зона: иконки -->
            <div class="flex items-center gap-1">
                <UButton
                    icon="i-lucide-heart"
                    variant="ghost"
                    color="gray"
                    square
                />
                <UButton
                    icon="i-lucide-git-compare"
                    variant="ghost"
                    color="gray"
                    square
                    class="hidden sm:inline-flex"
                />
                <!-- Телефоны только на lg+ -->
                <div class="hidden lg:flex flex-col items-end mr-3">
                    <a href="tel:+78129426246" class="text-xs font-medium">
                        +7 (812) 111-11-11
                    </a>
                    <a href="tel:+78129359083" class="text-xs text-gray-500">
                        +7 (812) 222-22-22
                    </a>
                </div>
                <UButton
                    icon="i-lucide-user"
                    variant="ghost"
                    color="gray"
                    class="hidden md:inline-flex"
                >
                    Личный кабинет
                </UButton>
            </div>
        </div>

        <!-- Нижняя полоса меню: появляется с md -->
        <div
            class="hidden es-header__bottom py-2 md:block md:mt-2 text-slate-50"
        >
            <div class="es-container flex items-center gap-4 py-2">
                <UPopover
                    v-model:open="catalogOpen"
                    :content="{
                        align: 'start',
                        side: 'bottom',
                        sideOffset: 8,
                    }"
                    :ui="{
                        content:
                            'w-full max-w-6xl p-0 shadow-2xl border-0 bg-white rounded-lg overflow-hidden',
                    }"
                >
                    <!-- Триггер -->
                    <UButton
                        color="primary"
                        icon="i-heroicons-bars-3"
                        class="es-catalog-btn min-w-[150px]"
                    >
                        Каталог
                        <UIcon
                            name="i-heroicons-chevron-down-20-solid"
                            class="w-4 h-4 ml-1"
                        />
                    </UButton>

                    <!-- Контент каталога -->
                    <template #content="{ close }">
                        <ClientOnly>
                            <div
                                class="p-3 max-w-[768px] w-full max-h-[60vh] overflow-y-auto bg-white dark:bg-gray-900 rounded-lg shadow-lg border border-gray-200 dark:border-gray-800"
                            >
                                <!-- Загрузка -->
                                <div
                                    v-if="pending"
                                    class="flex items-center justify-center py-8"
                                >
                                    <USkeleton class="h-4 w-32 mx-auto" />
                                </div>

                                <!-- Ошибка -->
                                <UAlert
                                    v-else-if="error"
                                    type="error"
                                    class="mb-3"
                                >
                                    Не удалось загрузить каталог
                                </UAlert>

                                <!-- Контент -->
                                <div
                                    v-else
                                    class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
                                >
                                    <div
                                        v-for="group in data?.catalog || []"
                                        :key="group.slug"
                                        class="min-w-0"
                                    >
                                        <!-- Заголовок категории -->
                                        <UButton
                                            variant="link"
                                            class="font-semibold text-gray-900 dark:text-white text-left px-1 py-1 -ml-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded w-full"
                                            :to="`/category/${group.slug}`"
                                            @click="close"
                                        >
                                            <UIcon
                                                :name="
                                                    getCategoryIcon(group.slug)
                                                "
                                                class="mr-2 text-gray-500 dark:text-gray-400"
                                                size="16"
                                            />
                                            {{ group.name }}
                                        </UButton>

                                        <!-- Список товаров -->
                                        <div class="mt-1 space-y-1">
                                            <NuxtLink
                                                v-for="product in group.products.slice(
                                                    0,
                                                    4,
                                                )"
                                                :key="product.id"
                                                :to="`/products/${product.slug}`"
                                                @click="close"
                                                class="block px-2 py-1.5 text-sm text-gray-700 dark:text-gray-300 rounded hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                                            >
                                                <div
                                                    class="flex justify-between items-start"
                                                >
                                                    <span class="truncate">{{
                                                        product.name
                                                    }}</span>
                                                    <span
                                                        class="font-medium whitespace-nowrap ml-2"
                                                        :class="{
                                                            'text-green-600 dark:text-green-400':
                                                                product.is_available,
                                                            'text-gray-400 line-through':
                                                                !product.is_available,
                                                        }"
                                                    >
                                                        {{
                                                            formatPrice(
                                                                product.price,
                                                            )
                                                        }}
                                                    </span>
                                                </div>
                                                <div
                                                    v-if="product.brand?.name"
                                                    class="text-xs text-gray-500 dark:text-gray-400 mt-0.5"
                                                >
                                                    {{ product.brand.name }}
                                                </div>
                                            </NuxtLink>

                                            <!-- "Показать все" если товаров >4 -->
                                            <UButton
                                                v-if="group.products.length > 4"
                                                variant="link"
                                                size="xs"
                                                class="px-2 py-1 mt-0.5 text-xs"
                                                :to="`/category/${group.slug}`"
                                                @click="close"
                                            >
                                                Показать все ({{
                                                    group.products.length
                                                }})
                                            </UButton>
                                        </div>
                                    </div>
                                </div>

                                <!-- Бренды (опционально внизу) -->
                                <div
                                    v-if="data?.brands && data.brands.length"
                                    class="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800"
                                >
                                    <h4
                                        class="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2"
                                    >
                                        Популярные бренды
                                    </h4>
                                    <div class="flex flex-wrap gap-2">
                                        <NuxtLink
                                            v-for="brand in data.brands.slice(
                                                0,
                                                6,
                                            )"
                                            :key="brand.id"
                                            :to="`/brand/${brand.slug}`"
                                            @click="close"
                                            class="inline-flex items-center px-2.5 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-xs font-medium text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700"
                                        >
                                            <UAvatar
                                                v-if="brand.logo"
                                                :src="brand.logo"
                                                :alt="brand.name"
                                                size="xs"
                                                class="mr-1.5"
                                            />
                                            <span>{{ brand.name }}</span>
                                        </NuxtLink>
                                    </div>
                                </div>
                            </div>
                            <template #fallback>
                                <div class="p-4 w-64">
                                    <USkeleton class="h-5 w-24 mb-3" />
                                    <div class="space-y-2">
                                        <USkeleton
                                            class="h-3 w-32"
                                            v-for="i in 4"
                                            :key="i"
                                        />
                                    </div>
                                </div>
                            </template>
                        </ClientOnly>
                    </template>
                </UPopover>
                <!-- Горизонтальное меню категорий -->
                <nav
                    class="es-categories flex-1 flex items-center gap-4 overflow-x-auto"
                >
                    <button
                        v-for="category in categories"
                        :key="category.id"
                        class="es-categories__item whitespace-nowrap text-sm"
                    >
                        {{ category.name }}
                    </button>
                </nav>
            </div>
        </div>

        <!-- Мобильное боковое меню (каталог + категории) -->
        <!-- <USlideover v-model="mobileMenu.open" side="left" class="md:hidden">
            <template #default>
                <div class="p-4 space-y-4">
                    <div class="flex items-center justify-between mb-2">
                        <span class="text-base font-semibold">Каталог</span>
                        <UButton
                            icon="i-heroicons-x-mark-20-solid"
                            variant="ghost"
                            color="gray"
                            square
                            @click="mobileMenu.open = false"
                        />
                    </div>

                    <UInput
                        v-model="searchQuery"
                        size="lg"
                        icon="i-heroicons-magnifying-glass-20-solid"
                        placeholder="Поиск по каталогу"
                        class="w-full"
                    />

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
                                    class="flex items-center justify-between p-3 rounded hover:bg-gray-50"
                                >
                                    <span class="font-medium text-sm">
                                        {{ category.name }}
                                    </span>
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

                            <div class="pt-1 space-y-1">
                                <NuxtLink
                                    v-for="product in category.products"
                                    :key="product.id"
                                    :to="`/products/${product.slug}`"
                                    class="block px-3 py-2 text-xs rounded hover:bg-gray-100"
                                >
                                    {{ product.name }}
                                </NuxtLink>
                            </div>
                        </UCollapsible>
                    </UCollapsibleGroup>

                    <div class="pt-4 border-t space-y-2 text-sm">
                        <a href="tel:+78129426246" class="block"
                            >+7 (812) 111-11-11</a
                        >
                        <a href="tel:+78129359083" class="block text-gray-600">
                            +7 (812) 222-22-22
                        </a>
                    </div>
                </div>
            </template>
        </USlideover> -->

        <!-- Отдельный mobile‑поиск (если хочешь полноэкранный поиск) -->
        <!-- <USlideover
            v-model="mobileMenu.searchOpen"
            side="top"
            class="md:hidden"
        >
            <template #default>
                <div class="p-4 space-y-4">
                    <div class="flex items-center justify-between">
                        <span class="text-base font-semibold">Поиск</span>
                        <UButton
                            icon="i-heroicons-x-mark-20-solid"
                            variant="ghost"
                            color="gray"
                            square
                            @click="mobileMenu.searchOpen = false"
                        />
                    </div>
                    <UInput
                        v-model="searchQuery"
                        size="lg"
                        icon="i-heroicons-magnifying-glass-20-solid"
                        placeholder="Что вы ищете?"
                        class="w-full"
                    />
                </div>
            </template>
        </USlideover> -->
    </header>
</template>

<script setup lang="ts">
import { useFormatPrice } from '~/composables/useFormatPrice';
const { formatPrice } = useFormatPrice();

interface Brand {
    id: number;
    name: string;
    slug: string;
    logo: string | null;
}

interface Product {
    id: number;
    name: string;
    slug: string;
    price: string;
    is_available: boolean;
    stock: number;
    brand: { id: number; name: string; logo?: string | null } | null;
}

interface CategoryGroup {
    id: number;
    name: string;
    slug: string;
    products: Product[];
}

interface OverviewResponse {
    brands: Brand[];
    categories: any[];
    catalog: CategoryGroup[];
}

const categories = ref<any[]>([]);
const activeDropdown = ref<number | null>(null);
const searchQuery = ref('');
const api = useApi();
const popoverProps = {
    align: 'start',
    side: 'bottom',
    sideOffset: 8,
};

const catalogOpen = ref(false);
const catalogDropdown = ref(false);

const mobileMenu = ref({
    open: false,
    searchOpen: false,
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

const { data, pending, error } = await api.get('/overview/', {
    server: false,
    // Кэшируем на 5 минут, чтобы не грузить API при каждом ховере
    getCachedData: (key) => {
        const entry = useNuxtApp().payload.data[key];
        if (entry && Date.now() - entry._timestamp < 5 * 60 * 1000) {
            return entry;
        }
    },
    // Добавляем timestamp для кэширования
    transform: (res) => ({ ...res, _timestamp: Date.now() }),
});

// Иконки по слагу категории
const getCategoryIcon = (slug: string): string => {
    const icons: Record<string, string> = {
        phones: 'i-heroicons-device-phone-mobile',
        laptops: 'i-heroicons-laptop',
        'vacuum-cleaners': 'i-heroicons-bolt',
        // добавьте свои
        default: 'i-heroicons-cube',
    };
    return icons[slug] || icons.default;
};

const fetchCategories = async () => {
    try {
        const response = await api.get('/categories/');
        categories.value = response.data.results;
        console.log('categories[0]', categories.value[0]);
    } catch (err) {
        console.error('Failed to fetch categories:', err);
    }
};

const loadProducts = async (categoryId: number) => {
    try {
        const res = await api.get(`/categories/${categoryId}/products/`);
        categories.value = categories.value.map((cat) =>
            cat.id === categoryId
                ? { ...cat, products: res.data.results ?? res.data }
                : cat,
        );
    } catch (err) {
        console.error('Failed to load products', err);
    }
};

onMounted(() => {
    fetchCategories();
});
</script>

<style scoped>
.es-header {
    background-color: #ffffff;
    border-bottom: 1px solid #e5e7eb;
    font-family: system-ui, -apple-system, BlinkMacSystemFont, sans-serif;
}

/* Общий контейнер */
.es-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 1rem;
}

/* Верхняя полоса */
.es-header__top {
    padding: 10px 0;
}

.es-header__top-inner {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
}

/* Логотип */
.es-logo {
    display: flex;
    align-items: center;
    text-decoration: none;
    color: inherit;
    gap: 0.75rem;
}

.es-logo__img {
    width: 56px;
    height: auto;
}

.es-logo__text {
    display: flex;
    flex-direction: column;
    line-height: 1.1;
}

.es-logo__title {
    letter-spacing: 0.08em;
}

.es-logo__subtitle {
    font-size: 0.68rem;
    text-transform: uppercase;
    color: #6b7280;
}

/* Поиск */
.es-search {
    flex: 1 1 auto;
}

.es-search__input {
    width: 100%;
}

/* Правая часть */
.es-header__right {
    display: flex;
    align-items: center;
    gap: 1.25rem;
}

.es-contacts {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 2px;
}

.es-contacts__phone {
    font-size: 0.9rem;
    font-weight: 500;
    color: #111827;
    text-decoration: none;
}

.es-contacts__phone:hover {
    color: #2563eb;
}

.es-icons {
    display: flex;
    align-items: center;
    gap: 0.25rem;
}

.es-icon-btn {
    padding-inline: 0.5rem;
}

/* Нижняя полоса */
.es-header__bottom {
    border-top: 1px solid #e5e7eb;
    background: #2d3748;
    color: #f9fafb;
}

.es-header__bottom-inner {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 8px 0;
}

/* Кнопка каталога */
.es-catalog-btn {
    min-width: 150px;
}

/* Категории */
.es-categories {
    flex: 1 1 auto;
    display: flex;
    align-items: center;
    gap: 1.5rem;
    overflow-x: auto;
}

.es-categories__item {
    border: none;
    background: transparent;
    color: #e5e7eb;
    padding: 0.15rem 0;
    cursor: pointer;
}

.es-categories__item:hover {
    color: #ffffff;
}

/* Адаптив */
@media (max-width: 767px) {
    .es-header__top-inner {
        align-items: flex-start;
    }

    .es-logo__title {
        font-size: 1rem;
    }

    .es-logo__subtitle {
        display: none;
    }

    .es-contacts {
        display: none;
    }
}
</style>
