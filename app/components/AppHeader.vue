<template>
  <header class="es-header border-b border-surface-900 bg-bg-900">
    <!-- Основной ряд: mobile first -->
    <div
      class="es-container flex items-center justify-between h-14 border-b border-surface-900"
    >
      <!-- Левая зона: бургер + логотип -->
      <div class="flex items-center gap-1">
        <NuxtLink
          to="/"
          class="flex items-center"
        >
          <img
            src="/logo-blue-izi.svg"
            alt="Izistor"
            class="es-logo__img h-8 w-auto"
          >
        </NuxtLink>
      </div>

      <!-- Центральная зона: поиск -->
      <div class="flex items-center justify-center flex-1 px-2 md:px-4">
        <!-- Иконка поиска на мобильных -->
        <USlideover
          v-model:open="mobileMenu.searchOpen"
          title="Поиск по каталогу"
          class="md:hidden"
          :close="{
            color: 'neutral',
            variant: 'outline',
            class: 'rounded-full !border-surface-700 !bg-surface-900 !text-text-100 hover:!bg-surface-700'
          }"
        >
          <UButton
            class="md:hidden"
            icon="i-heroicons-magnifying-glass-20-solid"
            color="neutral"
            variant="ghost"
            square
            @click="mobileMenu.searchOpen = true"
          />

          <template #body>
            <div class="px-4 py-4">
              <UInput
                v-model="searchQuery"
                size="lg"
                icon="i-heroicons-magnifying-glass-20-solid"
                placeholder="Например, iPhone 15 Pro"
                class="w-full"
                autofocus
              />

              <div class="mt-4">
                <div
                  v-if="shouldShowSearchState"
                  class="es-search-results"
                >
                  <div
                    v-if="searchPending"
                    class="es-search-results__state"
                  >
                    <UIcon
                      name="i-lucide-loader-circle"
                      class="h-4 w-4 animate-spin"
                    />
                    <span>Ищем товары...</span>
                  </div>

                  <div
                    v-else-if="searchError"
                    class="es-search-results__state es-search-results__state_error"
                  >
                    {{ searchError }}
                  </div>

                  <div
                    v-else-if="searchResults.length"
                    class="es-search-results__list"
                  >
                    <button
                      v-for="product in searchResults"
                      :key="product.id"
                      type="button"
                      class="es-search-results__item"
                      @click="selectSearchResult(product.slug)"
                    >
                      <div class="es-search-results__main">
                        <span class="es-search-results__name">{{ product.name }}</span>
                        <span class="es-search-results__category">
                          {{ product.category?.name }}
                        </span>
                      </div>
                      <span class="es-search-results__price">
                        от {{ formatPrice(getMinPrice(product.variants)) }}
                      </span>
                    </button>
                  </div>

                  <div
                    v-else
                    class="es-search-results__state"
                  >
                    Ничего не найдено
                  </div>
                </div>

                <div
                  v-else
                  class="es-search-results__hint"
                >
                  Введите минимум 2 символа, чтобы найти товар
                </div>
              </div>
            </div>
          </template>
        </USlideover>

        <!-- Поле поиска на md+ -->
        <div class="relative hidden md:flex w-full max-w-md">
          <UInput
            v-model="searchQuery"
            size="md"
            icon="i-heroicons-magnifying-glass-20-solid"
            placeholder="Поиск по каталогу"
            class="w-full"
            @focus="desktopSearchFocused = true"
            @input="desktopSearchFocused = true"
            @blur="handleDesktopSearchBlur"
            @keydown.enter.prevent="handleSearchSubmit"
          />

          <div
            v-if="shouldShowDesktopSearchResults"
            class="es-search-results es-search-results_desktop"
          >
            <div
              v-if="searchPending"
              class="es-search-results__state"
            >
              <UIcon
                name="i-lucide-loader-circle"
                class="h-4 w-4 animate-spin"
              />
              <span>Ищем товары...</span>
            </div>

            <div
              v-else-if="searchError"
              class="es-search-results__state es-search-results__state_error"
            >
              {{ searchError }}
            </div>

            <div
              v-else-if="searchResults.length"
              class="es-search-results__list"
            >
              <button
                v-for="product in searchResults"
                :key="product.id"
                type="button"
                class="es-search-results__item"
                @mousedown.prevent
                @click="selectSearchResult(product.slug)"
              >
                <div class="es-search-results__main">
                  <span class="es-search-results__name">{{ product.name }}</span>
                  <span class="es-search-results__category">
                    {{ product.category?.name }}
                  </span>
                </div>
                <span class="es-search-results__price">
                  от {{ formatPrice(getMinPrice(product.variants)) }}
                </span>
              </button>
            </div>

            <div
              v-else
              class="es-search-results__state"
            >
              Ничего не найдено
            </div>
          </div>
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
          :class="cartItemsCount > 0 ? 'text-text-100' : 'text-text-400'"
          aria-label="Корзина"
          @click="goToCart"
        >
          <span
            v-if="cartItemsCount > 0"
            class="absolute -top-1 -right-1 bg-text-100 text-bg-950 text-xs rounded-full h-5 w-5 flex items-center justify-center"
          >
            {{ cartItemsCount }}
          </span>
        </UButton>
        <!-- Телефоны только на lg+ -->
        <div class="hidden lg:flex flex-col items-end mr-3">
          <a
            href="tel:+79517505749"
            class="es-header__phone-primary text-xs font-medium text-text-100"
          >
            +7 (951) 750-57-49
          </a>
          <a
            href="tel:+79113625699"
            class="text-xs text-text-400"
          >
            +7 (911) 362-56-99
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
      <div
        class="es-mobile-shortcuts es-container flex h-full items-center gap-2 py-0"
      >
        <!-- Бургер только на мобильных -->
        <USlideover
          v-model:open="mobileMenu.open"
          title="Каталог"
          class="md:hidden"
          :close="{
            color: 'neutral',
            variant: 'outline',
            class: 'rounded-full !border-surface-700 !bg-surface-900 !text-text-100 hover:!bg-surface-700'
          }"
        >
          <UButton
            icon="i-heroicons-bars-3"
            color="neutral"
            variant="ghost"
            size="xl"
            square
            class="shrink-0"
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
                    class="font-semibold text-text-100 text-left px-1 py-1 -ml-1 hover:bg-surface-900 rounded w-full flex justify-between items-center"
                    @click="toggleCategory(group.slug)"
                  >
                    <div class="flex items-center">
                      <UIcon
                        :name="getCategoryIcon(group.slug)"
                        class="mr-2 text-text-400"
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
                      class="text-text-400"
                      size="16"
                    />
                  </UButton>

                  <!-- Товары (показываются только если категория раскрыта) -->
                  <div
                    v-if="expandedCategory === group.slug"
                    class="mt-2 space-y-1 ml-2 border-l-2 border-surface-900 pl-2"
                  >
                    <NuxtLink
                      v-for="product in group.products.slice(
                        0,
                        4
                      )"
                      :key="product.id"
                      :to="`/products/${product.slug}`"
                      class="block px-2 py-1.5 text-sm text-text-100 rounded hover:bg-surface-900 transition-colors"
                      @click="closeSlideover"
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
                            'text-success':
                              product.is_active,
                            'text-text-400 line-through':
                              !product.is_active
                          }"
                        >
                          от
                          {{
                            formatPrice(
                              getMinPrice(
                                product.variants
                              )
                            )
                          }}
                        </span>
                      </div>
                      <div
                        v-if="product.brand?.name"
                        class="text-xs text-text-400 mt-0.5"
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

        <div class="es-mobile-shortcuts__scroll">
          <NuxtLink
            v-for="link in appleQuickLinks"
            :key="link.slug"
            :to="`/categories/${link.slug}`"
            class="es-mobile-shortcuts__item"
            :aria-label="link.label"
          >
            <UIcon
              :name="link.icon"
              class="w-4 h-4"
            />
            <span>{{ link.shortLabel }}</span>
          </NuxtLink>
        </div>
      </div>
    </div>

    <!-- Нижняя полоса меню: появляется с md -->
    <div
      class="hidden md:block es-header__bottom py-2 border-b border-surface-900 bg-bg-900"
    >
      <div class="es-container flex items-center gap-4 py-2">
        <UPopover
          v-model:open="catalogOpen"
          modal
          :open-delay="100"
          :close-delay="300"
          :content="{
            align: 'start',
            side: 'bottom',
            sideOffset: 8
          }"
          :ui="{
            content:
              'w-full p-0 shadow-2xl border border-surface-900 bg-bg-900 rounded-lg overflow-hidden max-h-[calc(100vh-100px)]'
          }"
        >
          <!-- Триггер -->
          <UButton
            color="primary"
            icon="i-heroicons-bars-3"
            class="es-catalog-btn min-w-[150px] !bg-surface-900 !text-text-100 !border !border-surface-700 hover:!bg-surface-700"
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
                class="p-3 w-full max-h-[calc(100vh-100px)] overflow-y-auto bg-bg-900 rounded-lg shadow-lg border border-surface-900"
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
                      class="font-semibold text-text-100 text-left px-1 py-1 -ml-1 hover:bg-surface-900 rounded w-full"
                      :to="`/categories/${group.slug}`"
                      @click="close"
                    >
                      <UIcon
                        :name="
                          getCategoryIcon(group.slug)
                        "
                        class="mr-2 text-text-400"
                        size="16"
                      />
                      {{ group.name }}
                    </UButton>

                    <!-- Список товаров -->
                    <div class="mt-1 space-y-1">
                      <NuxtLink
                        v-for="product in group.products.slice(
                          0,
                          4
                        )"
                        :key="product.id"
                        :to="`/products/${product.slug}`"
                        class="block px-2 py-1.5 text-sm text-text-100 rounded hover:bg-surface-900 transition-colors"
                        @click="close"
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
                              'text-success':
                                product.is_active,
                              'text-text-400 line-through':
                                !product.is_active
                            }"
                          >
                            от
                            {{
                              formatPrice(
                                getMinPrice(
                                  product.variants
                                )
                              )
                            }}
                          </span>
                        </div>
                        <div
                          v-if="product.brand?.name"
                          class="text-xs text-text-400 mt-0.5"
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
                  class="mt-4 pt-4 border-t border-surface-900"
                >
                  <h4
                    class="text-xs font-medium text-text-400 mb-2"
                  >
                    Популярные бренды
                  </h4>
                  <div class="flex flex-wrap gap-2">
                    <NuxtLink
                      v-for="brand in data.brands.slice(
                        0,
                        6
                      )"
                      :key="brand.id"
                      :to="`/brand/${brand.slug}`"
                      class="inline-flex items-center px-2.5 py-1 rounded-full bg-surface-900 text-xs font-medium text-text-100 hover:bg-surface-700"
                      @click="close"
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
                      v-for="i in 4"
                      :key="i"
                      class="h-3 w-32"
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
            class="es-categories__item text-text-100 whitespace-nowrap text-sm"
          >
            <UIcon
              :name="getCategoryIcon(category.slug)"
              class="es-categories__icon"
            />
            {{ category.name }}
          </NuxtLink>
        </nav>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'
import { storeToRefs } from 'pinia'
import { useFormatPrice } from '~/composables/useFormatPrice'
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useCart } from '~/composables/useCart'
import type { Category, Product, ProductListResponse, ProductVariant } from '~/types/product'

// ПРАВИЛЬНАЯ ИНИЦИАЛИЗАЦИЯ ЧЕРЕЗ STORE
// доступ к функциям через cart.function & authStore.function
const { cartItemsCount, fetchCart } = useCart()
const authStore = useAuthStore()

// ✅ Реактивные refs (рекомендуется)
const { user, isAuthenticated, initError }
  = storeToRefs(authStore)

const userDisplayName = computed(() => {
  // ✅ Безопасно: проверяем user.value ДО доступа к свойствам
  if (!user.value) return ''

  const { first_name, last_name, username, email } = user.value
  if (first_name || last_name) {
    return (
      `${first_name || ''} ${last_name || ''}`.trim() || username || email
    )
  }
  return username || email || 'Пользователь'
})

// Методы для авторизации
const goToLogin = () => {
  navigateTo('/login')
}

const handleLogout = async () => {
  await authStore.logout()
  // После logout можно принудительно обновить профиль или просто navigate
}

const { formatPrice } = useFormatPrice()

const categories = ref<Category[]>([])
const searchQuery = ref('')
const searchResults = ref<Product[]>([])
const searchPending = ref(false)
const searchError = ref('')
const searchResolved = ref(false)
const desktopSearchFocused = ref(false)
const api = useApi()
let searchDebounceTimer: ReturnType<typeof setTimeout> | null = null
let searchRequestId = 0

const getMinPrice = (variants: ProductVariant[] | null | undefined) => {
  // Проверяем, что variants существует и является массивом
  if (!variants || !Array.isArray(variants)) {
    return ''
  }

  // Фильтруем активные варианты
  const activeVariants = variants.filter(v => v.is_active)

  // Если нет активных вариантов, возвращаем 0
  if (activeVariants.length === 0) {
    return ''
  }

  // Получаем минимальную цену среди активных вариантов
  const minPrice = Math.min(
    ...activeVariants.map((v) => {
      // Приводим цену к числу (цена может быть строкой "15000.00")
      const price = parseFloat(v.price)
      // Проверяем, что это валидное число
      return isNaN(price) ? Infinity : price
    })
  )

  // Если все цены были некорректными, возвращаем 0
  return minPrice === Infinity ? '' : minPrice
}

const catalogOpen = ref(false)
const mobileMenu = ref({
  open: false,
  searchOpen: false,
  activeCategory: null as number | null
})

const normalizedSearchQuery = computed(() => searchQuery.value.trim())
const shouldShowSearchState = computed(() =>
  normalizedSearchQuery.value.length >= 2
  && (
    searchPending.value
    || searchError.value.length > 0
    || searchResults.value.length > 0
    || searchResolved.value
  )
)
const shouldShowDesktopSearchResults = computed(() =>
  desktopSearchFocused.value && shouldShowSearchState.value
)

// Реактивное состояние для раскрытой категории
const expandedCategory = ref<string | null>(null)

// Переключение категории
function toggleCategory(slug: string) {
  expandedCategory.value = expandedCategory.value === slug ? null : slug
}

// Закрытие слайдовера (и сброс состояния)
function closeSlideover() {
  mobileMenu.value.open = false
  expandedCategory.value = null // опционально: сбрасывать при переходе
}

function resetSearchState() {
  searchResults.value = []
  searchPending.value = false
  searchError.value = ''
  searchResolved.value = false
}

function handleDesktopSearchBlur() {
  window.setTimeout(() => {
    desktopSearchFocused.value = false
  }, 120)
}

async function fetchSearchResults(query: string) {
  const requestId = ++searchRequestId

  searchPending.value = true
  searchError.value = ''
  searchResolved.value = false

  try {
    const response = await api.get<ProductListResponse>('/v1/products/search/', {
      params: { q: query },
      skipAuth: true
    })

    if (requestId !== searchRequestId) {
      return
    }

    searchResults.value = response.data.results ?? []
  } catch (error: unknown) {
    if (requestId !== searchRequestId) {
      return
    }

    searchResults.value = []
    searchError.value = 'Не удалось выполнить поиск'
    console.error('Search request failed:', error)
  } finally {
    if (requestId === searchRequestId) {
      searchPending.value = false
      searchResolved.value = true
    }
  }
}

function handleSearchSubmit() {
  if (searchResults.value.length > 0) {
    selectSearchResult(searchResults.value[0].slug)
  }
}

function selectSearchResult(slug: string) {
  desktopSearchFocused.value = false
  mobileMenu.value.searchOpen = false
  searchQuery.value = ''
  resetSearchState()
  navigateTo(`/products/${slug}`)
}

// Используем useAsyncData для реактивности и кэширования Nuxt
const { data, pending, error } = await useAsyncData(
  'overview-data', // 1. Уникальный ключ для кэша
  () =>
    api.get('/v1/overview/', {
      skipAuth: true // 👈 2. Флаг для Axios (чтобы не отправлять токен)
    }),
  {
    // 3. Настройки Nuxt (server, cache, lazy и т.д.)
    server: false,

    getCachedData: (key) => {
      const entry = useNuxtApp().payload.data[key]
      if (entry && Date.now() - entry._timestamp < 5 * 60 * 1000) {
        return entry
      }
    },

    // 4. Трансформация: Axios возвращает объект { data, status... },
    // нам нужно достать payload из .data и добавить timestamp
    transform: response => ({
      ...response.data,
      _timestamp: Date.now()
    })
  }
)

// Иконки по слагу категории
const getCategoryIcon = (slug: string): string => {
  const icons: Record<string, string> = {
    'phones': 'i-heroicons-device-phone-mobile',
    'laptops': 'i-heroicons-computer-desktop',
    'vacuum-cleaners': 'i-heroicons-bolt',
    // добавьте свои
    'default': 'i-heroicons-cube'
  }
  return icons[slug] ?? 'i-heroicons-cube'
}

const appleQuickLinks = [
  {
    slug: 'iphone',
    label: 'iPhone',
    shortLabel: 'iPhone',
    icon: 'i-lucide-smartphone'
  },
  {
    slug: 'ipad',
    label: 'iPad',
    shortLabel: 'iPad',
    icon: 'i-lucide-tablet'
  },
  {
    slug: 'mac',
    label: 'Mac',
    shortLabel: 'Mac',
    icon: 'i-lucide-monitor'
  },
  {
    slug: 'macbook',
    label: 'MacBook',
    shortLabel: 'Book',
    icon: 'i-lucide-laptop'
  },
  {
    slug: 'apple-watch',
    label: 'Apple Watch',
    shortLabel: 'Watch',
    icon: 'i-lucide-watch'
  },
  {
    slug: 'airpods',
    label: 'AirPods',
    shortLabel: 'Pods',
    icon: 'i-lucide-headphones'
  },
  {
    slug: 'apple-tv',
    label: 'Apple TV',
    shortLabel: 'TV',
    icon: 'i-lucide-tv'
  },
  {
    slug: 'mac-studio',
    label: 'Mac Studio',
    shortLabel: 'Studio',
    icon: 'i-lucide-cpu'
  }
]

const fetchCategories = async () => {
  try {
    const response = await api.get('/v1/categories/header-menu/', {
      skipAuth: true // 👈 Добавили флаг
    })
    // console.log('response -', response);
    categories.value = response.data as Category[]
  } catch (err: unknown) {
    const errorResponse = (err as { response?: { data?: unknown } })?.response?.data
    console.error('Failed to fetch categories:', errorResponse || err)
  }
}

// 📊 Реактивные вычисляемые свойства для корзины
// const cartItemsCount = computed(() => getTotalItems());
// const cartTotalPrice = computed(() => getTotalPrice());

// 🧭 Метод навигации в корзину
const goToCart = () => {
  navigateTo('/cart')
}

onMounted(async () => {
  if (import.meta.client) {
    // ✅ Ждём полной инициализации
    const success = await authStore.initialize()
    if (!success && initError.value) {
      console.error('Auth error:', initError.value)
    }
  }
  // console.log('mobileMenu', mobileMenu);

  // ✅ ЗАГРУЗКА КОРЗИНЫ ДЛЯ ВСЕХ ПОЛЬЗОВАТЕЛЕЙ (включая анонимов!)
  try {
    await fetchCart() // ← Работает через сессию даже без авторизации
  } catch (err) {
    console.warn('Не удалось загрузить корзину:', err)
  }
  fetchCategories()
})

watch(searchQuery, (value) => {
  const query = value.trim()

  if (searchDebounceTimer) {
    clearTimeout(searchDebounceTimer)
  }

  if (query.length < 2) {
    searchRequestId += 1
    resetSearchState()
    return
  }

  searchDebounceTimer = window.setTimeout(() => {
    fetchSearchResults(query)
  }, 300)
})

watch(
  () => isAuthenticated.value,
  async () => {
    if (!import.meta.client) {
      return
    }

    try {
      await fetchCart()
    } catch (err) {
      console.warn('Не удалось обновить корзину после смены авторизации:', err)
    }
  }
)

onBeforeUnmount(() => {
  if (searchDebounceTimer) {
    clearTimeout(searchDebounceTimer)
  }
})
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
    max-width: 1280px;
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
    width: 160px;
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
    color: var(--color-text-400);
}

.es-header__phone-primary {
    transition: color 0.2s ease;
}

.es-header__phone-primary:hover {
    color: var(--color-text-400);
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
    color: var(--color-text-100);
    text-decoration: none;
}

.es-contacts__phone:hover {
    color: var(--color-accent-400);
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
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    border: none;
    background: transparent;
    color: var(--color-text-100);
    padding: 0.15rem 0;
    cursor: pointer;
    text-transform: uppercase;
    transition: color 0.2s ease;
}

.es-categories__item:hover {
    color: var(--color-text-400);
}

.es-categories__icon {
    width: 1rem;
    height: 1rem;
    flex: 0 0 auto;
    color: currentColor;
}

.es-search-results {
    border: 1px solid color-mix(in srgb, var(--color-text-100) 12%, transparent);
    border-radius: 1rem;
    background: color-mix(in srgb, var(--color-bg-950) 88%, var(--color-surface-900));
    box-shadow: 0 24px 48px rgb(0 0 0 / 0.28);
    overflow: hidden;
}

.es-search-results_desktop {
    position: absolute;
    top: calc(100% + 0.5rem);
    left: 0;
    right: 0;
    z-index: 30;
}

.es-search-results__list {
    display: flex;
    flex-direction: column;
}

.es-search-results__item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    width: 100%;
    padding: 0.85rem 1rem;
    text-align: left;
    color: var(--color-text-100);
    background: transparent;
    border: 0;
    border-bottom: 1px solid color-mix(in srgb, var(--color-text-400) 14%, transparent);
    transition: background-color 0.2s ease;
}

.es-search-results__item:last-child {
    border-bottom: 0;
}

.es-search-results__item:hover {
    background: color-mix(in srgb, var(--color-surface-900) 72%, transparent);
}

.es-search-results__main {
    display: flex;
    flex-direction: column;
    min-width: 0;
    gap: 0.2rem;
}

.es-search-results__name {
    font-size: 0.95rem;
    font-weight: 600;
    line-height: 1.2;
}

.es-search-results__category {
    font-size: 0.78rem;
    color: var(--color-text-400);
    line-height: 1.2;
}

.es-search-results__price {
    flex: 0 0 auto;
    font-size: 0.82rem;
    font-weight: 600;
    color: var(--color-accent-400);
    white-space: nowrap;
}

.es-search-results__state {
    display: flex;
    align-items: center;
    gap: 0.55rem;
    padding: 1rem;
    font-size: 0.9rem;
    color: var(--color-text-100);
}

.es-search-results__state_error {
    color: #f87171;
}

.es-search-results__hint {
    padding: 0.8rem 0.1rem 0;
    font-size: 0.85rem;
    color: var(--color-text-400);
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

.es-mobile-shortcuts::-webkit-scrollbar {
    display: none;
}

.es-mobile-shortcuts {
    align-items: center;
    -ms-overflow-style: none;
    scrollbar-width: none;
}

.es-mobile-shortcuts__scroll {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    flex: 1 1 auto;
    min-width: 0;
    overflow-x: auto;
    overflow-y: hidden;
    padding-right: 0.1rem;
    -ms-overflow-style: none;
    scrollbar-width: none;
}

.es-mobile-shortcuts__scroll::-webkit-scrollbar {
    display: none;
}

.es-mobile-shortcuts__item {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.28rem;
    flex: 0 0 auto;
    min-height: 1.9rem;
    padding: 0.35rem 0.58rem;
    border: 1px solid color-mix(in srgb, var(--color-surface-900) 85%, black);
    border-radius: 9999px;
    color: var(--color-text-100);
    background: color-mix(in srgb, var(--color-bg-950) 80%, var(--color-surface-900));
    font-size: 0.68rem;
    font-weight: 500;
    line-height: 1;
    white-space: nowrap;
    transition:
        background-color 0.2s ease,
        border-color 0.2s ease,
        color 0.2s ease;
}

.es-mobile-shortcuts__item :deep(.iconify) {
    width: 0.82rem;
    height: 0.82rem;
}

.es-mobile-shortcuts__item:hover {
    color: var(--color-accent-300);
    border-color: var(--color-accent-400);
    background: color-mix(in srgb, var(--color-surface-900) 92%, var(--color-bg-950));
}
</style>
