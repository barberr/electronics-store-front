<template>
    <header class="es-header border-b border-surface-900 bg-bg-900">
        <!-- Основной ряд: mobile first -->
        <div
            class="es-container max-w-7xl flex items-center justify-between h-14 border-b border-surface-900"
        >
            <!-- Левая зона: бургер + логотип -->
            <div class="flex items-center gap-1">
                <!-- Логотип + текст -->
                <NuxtLink to="/" class="flex items-center gap-2">
                    <img
                        src="/logo-electronics-store.svg"
                        alt="Izistor"
                        class="es-logo__img w-8 h-8"
                    />
                    <span
                        class="es-logo__title text-text-100 font-semibold tracking-wide uppercase"
                    >
                        Izistor
                    </span>
                </NuxtLink>
            </div>

            <!-- Центральная зона: поиск -->
            <div class="flex items-center justify-center flex-1 px-2 md:px-4">
                <!-- Иконка поиска на мобильных -->
                <UButton
                    class="md:hidden"
                    icon="i-heroicons-magnifying-glass-20-solid"
                    color="neutral"
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
                    color="neutral"
                    square
                    class="hidden sm:inline-flex"
                />
                <UButton
                    icon="i-lucide-git-compare"
                    variant="ghost"
                    color="neutral"
                    square
                    class="hidden sm:inline-flex"
                />
                <!-- КОРЗИНА - НОВАЯ КНОПКА -->
                <UButton
                    icon="i-lucide-shopping-cart"
                    variant="ghost"
                    color="neutral"
                    class="relative"
                    :class="cart.cartItemsCount.value > 0 ? 'text-accent-300' : 'text-text-400'"
                    @click="goToCart"
                    aria-label="Корзина"
                >
                    <span 
                    v-if="cart.cartItemsCount.value > 0" 
                    class="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center"
                    >
                    {{ cart.cartItemsCount }}
                    </span>
                </UButton>
                <!-- Телефоны только на lg+ -->
                <div class="hidden lg:flex flex-col items-end mr-3">
                    <a
                        href="tel:+78129426246"
                        class="text-xs font-medium text-text-100 hover:text-accent-300"
                    >
                        +7 (812) 111-11-11
                    </a>
                    <a href="tel:+78129359083" class="text-xs text-text-400">
                        +7 (812) 222-22-22
                    </a>
                </div>
                <!-- Если НЕ авторизован -->
                <template v-if="!isAuthenticated">
                    <UButton
                        icon="i-lucide-user"
                        variant="ghost"
                        color="neutral"
                        class="hidden md:inline-flex"
                        @click="goToLogin"
                    >
                        Войти
                    </UButton>
                </template>

                <!-- Если авторизован -->
                <template v-else>
                    <div class="flex items-center gap-1">
                        <UButton
                            icon="i-lucide-user"
                            variant="ghost"
                            color="neutral"
                            class="hidden md:inline-flex"
                            :to="`/profile`"
                        >
                            {{ userDisplayName }}
                        </UButton>
                        <UButton
                            variant="ghost"
                            color="neutral"
                            class="hidden md:inline-flex"
                            @click="handleLogout"
                        >
                            Выйти
                        </UButton>
                    </div>
                </template>
            </div>

            <!-- для мобильных -->
            <div class="md:hidden pl-8">
                <template v-if="!isAuthenticated">
                    <UButton
                        icon="i-lucide-user"
                        variant="ghost"
                        color="neutral"
                        class="md:hidden"
                        @click="goToLogin"
                    >
                        Войти
                    </UButton>
                </template>

                <!-- Если авторизован -->
                <template v-else>
                    <div class="flex items-center gap-1">
                        <UButton
                            icon="i-lucide-user"
                            variant="ghost"
                            color="neutral"
                            class="md:hidden"
                            :to="`/profile`"
                        >
                            {{ user.first_name }}
                        </UButton>
                        <UButton
                            icon="i-lucide-log-out"
                            variant="ghost"
                            color="neutral"
                            class="md:hidden"
                            @click="handleLogout"
                        >
                            <span class="hidden md:inline-block">Выйти</span>
                        </UButton>
                    </div>
                </template>
            </div>
        </div>
        <div
            class="block md:hidden mdflex flex-row items-center border-b border-surface-900 bg-bg-900 h-14"
        >
            <!-- Бургер только на мобильных -->
            <USlideover
                v-model:open="mobileMenu.open"
                title="Каталог"
                class="md:hidden pl-8"
                :close="{
                    color: 'primary',
                    variant: 'outline',
                    class: 'rounded-full',
                }"
            >
                <UButton
                    icon="i-heroicons-bars-3"
                    color="neutral"
                    variant="ghost"
                    size="xl"
                    square
                    @click="mobileMenu.open = true"
                />

                <template #body>
                    <ClientOnly>
                        <div
                            v-if="data?.catalog"
                            class="px-4 py-2 space-y-4 max-h-[calc(100vh-120px)] overflow-y-auto"
                        >
                            <div
                                v-for="group in data.catalog"
                                :key="group.slug"
                                class="min-w-0"
                            >
                                <!-- Заголовок категории (кликабельный) -->
                                <UButton
                                    variant="link"
                                    class="font-semibold text-gray-900 dark:text-white text-left px-1 py-1 -ml-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded w-full flex justify-between items-center"
                                    @click="toggleCategory(group.slug)"
                                >
                                    <div class="flex items-center">
                                        <UIcon
                                            :name="getCategoryIcon(group.slug)"
                                            class="mr-2 text-gray-500 dark:text-gray-400"
                                            size="16"
                                        />
                                        {{ group.name }}
                                    </div>
                                    <!-- Иконка стрелки вниз/вверх -->
                                    <UIcon
                                        :name="
                                            expandedCategory === group.slug
                                                ? 'i-heroicons-chevron-up'
                                                : 'i-heroicons-chevron-down'
                                        "
                                        class="text-gray-500 dark:text-gray-400"
                                        size="16"
                                    />
                                </UButton>

                                <!-- Товары (показываются только если категория раскрыта) -->
                                <div
                                    v-if="expandedCategory === group.slug"
                                    class="mt-2 space-y-1 ml-2 border-l-2 border-gray-200 dark:border-gray-700 pl-2"
                                >
                                    <NuxtLink
                                        v-for="product in group.products.slice(
                                            0,
                                            4,
                                        )"
                                        :key="product.id"
                                        :to="`/products/${product.slug}`"
                                        @click="closeSlideover"
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
                                                        product.is_active,
                                                    'text-gray-400 line-through':
                                                        !product.is_active,
                                                }"
                                            >
                                                от
                                                {{
                                                    formatPrice(
                                                        getMinPrice(
                                                            product.variants,
                                                        ),
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
                                        :to="`/categories/${group.slug}`"
                                        @click="closeSlideover"
                                    >
                                        Показать все ({{
                                            group.products.length
                                        }})
                                    </UButton>
                                </div>
                            </div>
                        </div>

                        <template #fallback>
                            <div class="px-4 py-6">
                                <USkeleton
                                    v-for="i in 3"
                                    :key="i"
                                    class="h-8 mb-4"
                                />
                            </div>
                        </template>
                    </ClientOnly>
                </template>
            </USlideover>
        </div>

        <!-- Нижняя полоса меню: появляется с md -->
        <div
            class="hidden md:block es-header__bottom py-2 border-b border-surface-900 bg-bg-900"
        >
            <div class="es-container max-w-7xl  flex items-center gap-4 py-2">
                <UPopover
                    modal
                    v-model:open="catalogOpen"
                    :open-delay="100"
                    :close-delay="300"
                    :content="{
                        align: 'start',
                        side: 'bottom',
                        sideOffset: 8,
                    }"
                    :ui="{
                        content:
                            'w-full p-0 shadow-2xl border-0 bg-white rounded-lg overflow-hidden max-h-[calc(100vh-100px)]',
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
                                class="p-3 w-full max-h-[calc(100vh-100px)] overflow-y-auto bg-white dark:bg-gray-900 rounded-lg shadow-lg border border-gray-200 dark:border-gray-800"
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
                                    class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2"
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
                                            :to="`/categories/${group.slug}`"
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
                                                                product.is_active,
                                                            'text-gray-400 line-through':
                                                                !product.is_active,
                                                        }"
                                                    >
                                                        от
                                                        {{
                                                            formatPrice(
                                                                getMinPrice(
                                                                    product.variants,
                                                                ),
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
                                                :to="`/categories/${group.slug}`"
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
                    <NuxtLink
                        v-for="category in categories"
                        :key="category.id"
                        :to="`/categories/${category.slug}`"
                        class="es-categories__item text-text-100 hover:text-accent-200 whitespace-nowrap text-sm"
                    >
                        {{ category.name }}
                    </NuxtLink>
                </nav>
            </div>
        </div>
    </header>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/stores/auth';
import { storeToRefs } from 'pinia';
import { useFormatPrice } from '~/composables/useFormatPrice';
import { computed, ref, onMounted } from 'vue';
import { useCart } from '~/composables/useCart';

// ПРАВИЛЬНАЯ ИНИЦИАЛИЗАЦИЯ ЧЕРЕЗ STORE
// доступ к функциям через cart.function & authStore.function
const cart = useCart();
const authStore = useAuthStore();

// ✅ Реактивные refs (рекомендуется)
const { user, isAuthenticated, isInitialized, initError, logout } =
    storeToRefs(authStore);
    
const userDisplayName = computed(() => {
    // ✅ Безопасно: проверяем user.value ДО доступа к свойствам
    if (!user.value) return '';

    const { first_name, last_name, username, email } = user.value;
    if (first_name || last_name) {
        return (
            `${first_name || ''} ${last_name || ''}`.trim() || username || email
        );
    }
    return username || email || 'Пользователь';
});

// Методы для авторизации
const goToLogin = () => {
    navigateTo('/login');
};

const goToAccount = () => {
    navigateTo('/profile');
};

const goToOrders = () => {
    navigateTo('/profile/orders');
};

const handleLogout = async () => {
    await authStore.logout();
    // После logout можно принудительно обновить профиль или просто navigate
};

const { formatPrice } = useFormatPrice();

const categories = ref<any[]>([]);
const activeDropdown = ref<number | null>(null);
const searchQuery = ref('');
const api = useApi();

const getMinPrice = (variants) => {
    // Проверяем, что variants существует и является массивом
    if (!variants || !Array.isArray(variants)) {
        return '';
    }

    // Фильтруем активные варианты
    const activeVariants = variants.filter((v) => v.is_active);

    // Если нет активных вариантов, возвращаем 0
    if (activeVariants.length === 0) {
        return '';
    }

    // Получаем минимальную цену среди активных вариантов
    const minPrice = Math.min(
        ...activeVariants.map((v) => {
            // Приводим цену к числу (цена может быть строкой "15000.00")
            const price = parseFloat(v.price);
            // Проверяем, что это валидное число
            return isNaN(price) ? Infinity : price;
        }),
    );

    // Если все цены были некорректными, возвращаем 0
    return minPrice === Infinity ? '' : minPrice;
};

const catalogOpen = ref(false);
const mobileMenu = ref({
    open: false,
    searchOpen: false,
    activeCategory: null as number | null,
});

// Реактивное состояние для раскрытой категории
const expandedCategory = ref(null);

// Переключение категории
function toggleCategory(slug) {
    expandedCategory.value = expandedCategory.value === slug ? null : slug;
}

// Закрытие слайдовера (и сброс состояния)
function closeSlideover() {
    mobileMenu.value.open = false;
    expandedCategory.value = null; // опционально: сбрасывать при переходе
}



// Используем useAsyncData для реактивности и кэширования Nuxt
const { data, pending, error } = await useAsyncData(
    'overview-data', // 1. Уникальный ключ для кэша
    () =>
        api.get('/v1/overview/', {
            skipAuth: true, // 👈 2. Флаг для Axios (чтобы не отправлять токен)
        }),
    {
        // 3. Настройки Nuxt (server, cache, lazy и т.д.)
        server: false,

        getCachedData: (key) => {
            const entry = useNuxtApp().payload.data[key];
            if (entry && Date.now() - entry._timestamp < 5 * 60 * 1000) {
                return entry;
            }
        },

        // 4. Трансформация: Axios возвращает объект { data, status... },
        // нам нужно достать payload из .data и добавить timestamp
        transform: (response) => ({
            ...response.data,
            _timestamp: Date.now(),
        }),
    },
);

// Иконки по слагу категории
const getCategoryIcon = (slug: string): string => {
    const icons: Record<string, string> = {
        phones: 'i-heroicons-device-phone-mobile',
        laptops: 'i-heroicons-computer-desktop',
        'vacuum-cleaners': 'i-heroicons-bolt',
        // добавьте свои
        default: 'i-heroicons-cube',
    };
    return icons[slug] || icons.default;
};

const fetchCategories = async () => {
    try {
        const response = await api.get('/v1/categories/header-menu/', {
            skipAuth: true, // 👈 Добавили флаг
        });
        // console.log('response -', response);
        categories.value = response.data;
    } catch (err: any) {
        console.error('Failed to fetch categories:', err.response?.data || err);
    }
};

const loadProducts = async (categoryId: number) => {
    try {
        const res = await api.get(`/v1/categories/${categoryId}/products/`);
        categories.value = categories.value.map((cat) =>
            cat.id === categoryId
                ? { ...cat, products: res.data.results ?? res.data }
                : cat,
        );
    } catch (err) {
        console.error('Failed to load products', err);
    }
};

// 📊 Реактивные вычисляемые свойства для корзины
// const cartItemsCount = computed(() => getTotalItems());
// const cartTotalPrice = computed(() => getTotalPrice());

// 🧭 Метод навигации в корзину
const goToCart = () => {
  navigateTo('/cart');
};

onMounted(async () => {
    if (process.client) {
        // ✅ Ждём полной инициализации
        const success = await authStore.initialize();
        if (!success && initError.value) {
            console.error('Auth error:', initError.value);
        }
    }
    // console.log('mobileMenu', mobileMenu);
    
    // ✅ ЗАГРУЗКА КОРЗИНЫ ДЛЯ ВСЕХ ПОЛЬЗОВАТЕЛЕЙ (включая анонимов!)
    try {
      await cart.fetchCart(); // ← Работает через сессию даже без авторизации
    } catch (err) {
      console.warn('Не удалось загрузить корзину:', err);
    }
    fetchCategories();
});
// watch(isAuthenticated, async (newAuthStatus) => {
//   if (process.client) {
//     // Небольшая задержка для стабильности
//     setTimeout(async () => {
//       await fetchCart();
//     }, 100);
//   }
// });

</script>

<style scoped>
.es-header {
    /* background-color: #ffffff; */
    /* border-bottom: 1px solid #e5e7eb; */
    /* font-family: system-ui, -apple-system, BlinkMacSystemFont, sans-serif; */
}

/* Общий контейнер */
.es-container {
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
    text-transform: uppercase;
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
