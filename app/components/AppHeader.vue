<template>
    <header class="es-header">
        <!-- Верхняя полоса -->
        <div class="es-header__top">
            <div class="es-container es-header__top-inner">
                <!-- Логотип + слоган -->
                <NuxtLink to="/" class="es-logo">
                    <img
                        src="/logo-electronics-store.svg"
                        alt="Electronics Store"
                        class="es-logo__img"
                    />
                    <div class="es-logo__text">
                        <span class="es-logo__title">Electronics-Store</span>
                        <span class="es-logo__subtitle"
                            >МИРОВЫЕ БРЕНДЫ И КАЧЕСТВО</span
                        >
                    </div>
                </NuxtLink>

                <!-- Поиск (десктоп) -->
                <div class="es-search hidden lg:flex">
                    <UInput
                        v-model="searchQuery"
                        size="lg"
                        icon="i-heroicons-magnifying-glass-20-solid"
                        placeholder="Поиск по каталогу"
                        class="es-search__input"
                    />
                </div>

                <!-- Контакты и иконки -->
                <div class="es-header__right">
                    <div class="es-contacts hidden md:flex">
                        <a href="tel:+78129426246" class="es-contacts__phone"
                            >+7 (812) 111-11-11</a
                        >
                        <a href="tel:+78129359083" class="es-contacts__phone"
                            >+7 (812) 222-22-22</a
                        >
                    </div>

                    <div class="es-icons">
                        <UButton
                            icon="i-lucide-heart"
                            variant="ghost"
                            color="gray"
                            class="es-icon-btn"
                        />
                        <UButton
                            icon="i-lucide-git-compare"
                            variant="ghost"
                            color="gray"
                            class="es-icon-btn"
                        />
                        <UButton
                            icon="i-lucide-user"
                            variant="ghost"
                            color="gray"
                            class="es-icon-btn hidden md:inline-flex"
                        >
                            Личный кабинет
                        </UButton>
                        <!-- Мобильное меню -->
                        <UButton
                            class="md:hidden es-icon-btn"
                            icon="i-heroicons-bars-3"
                            variant="ghost"
                            color="gray"
                            @click="mobileMenu.open = true"
                        />
                    </div>
                </div>
            </div>
        </div>

        <!-- Нижняя полоса с меню -->
        <div class="es-header__bottom">
            <div class="es-container es-header__bottom-inner">
                <!-- Кнопка каталога -->
                <UButton
                    color="primary"
                    icon="i-heroicons-bars-3"
                    class="es-catalog-btn"
                >
                    Каталог
                </UButton>

                <!-- Поиск на планшетах/мобилках -->
                <div class="es-search flex lg:hidden">
                    <UInput
                        v-model="searchQuery"
                        size="md"
                        icon="i-heroicons-magnifying-glass-20-solid"
                        placeholder="Поиск по каталогу"
                        class="es-search__input"
                    />
                </div>

                <!-- Горизонтальное меню категорий (десктоп) -->
                <nav class="es-categories hidden lg:flex">
                    <button
                        v-for="category in categories"
                        :key="category.id"
                        class="es-categories__item"
                        @mouseenter="openDropdown(category.id)"
                        @mouseleave="closeDropdown"
                    >
                        <!-- можно выводить иконку категории, если есть -->
                        <span class="es-categories__label">{{
                            category.name
                        }}</span>
                    </button>
                </nav>
            </div>
        </div>

        <!-- Мобильное боковое меню -->
        <USlideover v-model="mobileMenu.open" side="left" class="md:hidden">
            <template #default>
                <div class="p-4 space-y-4">
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
                            <div class="pt-1 space-y-1">
                                <NuxtLink
                                    v-for="product in category.products"
                                    :key="product.id"
                                    :to="`/products/${product.slug}`"
                                    class="block px-3 py-2 text-sm rounded hover:bg-gray-100"
                                >
                                    {{ product.name }}
                                </NuxtLink>
                            </div>
                        </UCollapsible>
                    </UCollapsibleGroup>

                    <div class="pt-4 border-t space-y-2 text-sm">
                        <a href="tel:+78129426246" class="block"
                            >+7 (812) 942-62-46</a
                        >
                        <a href="tel:+78129359083" class="block"
                            >+7 (812) 935-90-83</a
                        >
                    </div>
                </div>
            </template>
        </USlideover>
    </header>
</template>

<script setup lang="ts">
const categories = ref<any[]>([]);
const activeDropdown = ref<number | null>(null);
const searchQuery = ref('');
const api = useApi();

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
        categories.value = response.data.results;
    } catch (err: any) {
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
    font-size: 1.1rem;
    font-weight: 700;
    letter-spacing: 0.06em;
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
    background-color: #0f172a;
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
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    border: none;
    background: transparent;
    color: #e5e7eb;
    font-size: 0.9rem;
    cursor: pointer;
    padding: 0.25rem 0;
    white-space: nowrap;
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
