<!-- app/pages/cart.vue -->
<template>
  <div class="cart-container py-8 px-4 sm:px-6 lg:px-8">
    <div class="max-w-7xl mx-auto">
      <!-- Заголовок -->
      <div class="text-center mb-10">
        <h1 class="text-3xl md:text-4xl font-bold text-text-100 mb-3">
          Ваша корзина
        </h1>
        <p class="text-text-400 text-lg">
          {{ cartItemsCount }} {{ getItemsDeclension(cartItemsCount) }}
          на сумму {{ formatCurrency(cartTotalPrice) }}
        </p>
      </div>

      <!-- Основное содержимое -->
      <div v-if="loading" class="flex justify-center py-12">
        <div class="text-center">
          <div class="w-12 h-12 border-4 border-accent-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p class="text-text-400">Загрузка корзины...</p>
        </div>
      </div>

      <div v-else-if="error" class="max-w-3xl mx-auto">
        <UAlert
          icon="i-heroicons-exclamation-triangle"
          color="error"
          variant="soft"
          class="text-red-400"
          :title="error"
          @close="fetchCartData"
        >
          <template #actions>
            <UButton
              color="error"
              variant="soft"
              size="xs"
              @click="fetchCartData"
            >
              Повторить
            </UButton>
          </template>
        </UAlert>
      </div>

      <div v-else-if="!cart || cart.items.length === 0" class="max-w-3xl mx-auto text-center py-16">
        <div class="mb-8">
          <div class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-surface-900 mx-auto">
            <UIcon name="i-heroicons-shopping-bag" class="text-3xl text-text-400" />
          </div>
        </div>
        <h2 class="text-2xl font-bold text-text-100 mb-3">
          Корзина пуста
        </h2>
        <p class="text-text-400 mb-8 max-w-md mx-auto">
          Добавьте товары в корзину, чтобы начать оформление заказа
        </p>
        <UButton
          to="/products"
          color="primary"
          size="lg"
          variant="solid"
          trailing-icon="i-heroicons-arrow-right"
        >
          Перейти к покупкам
        </UButton>
      </div>

      <div v-else class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Список товаров -->
        <div class="lg:col-span-2 space-y-6">
          <UCard
            v-for="item in cart.items"
            :key="item.id"
            class="p-5 hover:shadow-md transition-shadow duration-200"
          >
            <div class="flex flex-col md:flex-row gap-4">
              <!-- Изображение -->
              <div class="flex-shrink-0 w-24 h-24">
                <div
                  v-if="item.variant_image"
                  class="w-full h-full bg-surface-900 rounded-lg overflow-hidden flex items-center justify-center"
                >
                  <img
                    :src="item.variant_image"
                    :alt="item.variant_name"
                    class="w-full h-full object-contain p-1"
                    loading="lazy"
                  />
                </div>
                <div
                  v-else
                  class="w-full h-full bg-surface-900 rounded-lg flex items-center justify-center"
                >
                  <UIcon name="i-heroicons-photo" class="text-3xl text-text-400" />
                </div>
              </div>

              <!-- Информация о товаре -->
              <div class="flex-grow min-w-0">
                <h3 class="font-semibold text-text-100 text-lg truncate">
                  {{ item.variant_name }}
                </h3>
                <p v-if="item.variant_name" class="text-text-400 text-sm mt-1">
                  {{ item.variant_name }}
                </p>
                <p class="font-bold text-text-100 mt-2">
                  {{ formatCurrency(parseFloat(item.variant_price)) }}
                </p>
              </div>

              <!-- Управление количеством -->
              <div class="flex flex-col items-end justify-between min-w-[120px]">
                <UButton
                  color="error"
                  variant="ghost"
                  size="xs"
                  icon="i-heroicons-trash"
                  @click="removeItem(item.id)"
                  :disabled="loading"
                />

                <div class="flex items-center gap-2 mt-2">
                  <UButton
                    :disabled="item.quantity <= 1 || loading"
                    size="sm"
                    variant="soft"
                    color="neutral"
                    icon="i-heroicons-minus"
                    @click="updateQuantity(item.id, item.quantity - 1)"
                  />
                  <div class="w-10 text-center font-medium">
                    {{ item.quantity }}
                  </div>
                  <UButton
                    :disabled="loading"
                    size="sm"
                    variant="soft"
                    color="neutral"
                    icon="i-heroicons-plus"
                    @click="updateQuantity(item.id, item.quantity + 1)"
                  />
                </div>
              </div>
            </div>
          </UCard>

          <!-- Действия с корзиной -->
          <div class="flex flex-col sm:flex-row sm:justify-between gap-4 mt-4">
            <UButton
              color="neutral"
              variant="outline"
              size="lg"
              icon="i-heroicons-arrow-uturn-left"
              :disabled="loading"
              @click="handleClearCart"
            >
              Очистить корзину
            </UButton>
            <UButton
              to="/products"
              color="primary"
              variant="outline"
              size="lg"
              trailing-icon="i-heroicons-arrow-left"
            >
              Продолжить покупки
            </UButton>
          </div>
        </div>

        <!-- Сводка заказа -->
        <div class="lg:col-span-1">
          <UCard class="p-6 sticky top-8">
            <h2 class="text-xl font-bold text-text-100 mb-6">
              Сводка заказа
            </h2>

            <div class="space-y-4 mb-6">
              <div class="flex justify-between text-text-100">
                <span>Товары ({{ cartItemsCount }})</span>
                <span class="font-bold">{{ formatCurrency(cartTotalPrice) }}</span>
              </div>
              <div class="flex justify-between text-text-100">
                <span>Доставка&nbsp;</span>
                <span class="text-text-400"> Рассчитывается при оформлении</span>
              </div>
              <div class="border-t border-surface-900 pt-4 flex justify-between font-bold text-text-100 text-lg">
                <span>Итого</span>
                <span>{{ formatCurrency(cartTotalPrice) }}</span>
              </div>
            </div>

            <UButton
              color="primary"
              size="xl"
              block
              :disabled="loading || cartItemsCount === 0"
              @click="handleCheckout"
              trailing-icon="i-heroicons-arrow-right"
            >
              {{ loading ? 'Оформляем...' : 'Оформить заказ' }}
            </UButton>

            <div class="mt-6 pt-6 border-t border-surface-900 text-center text-text-400 text-sm">
              <p class="mb-2">Все цены включают НДС</p>
              <p>Оплата при получении или онлайн</p>
            </div>
          </UCard>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia';

definePageMeta({
  middleware: 'auth', // Требует авторизации для доступа к корзине
});

const cartStore = useCartStore();
const {
  cart,
  loading,
  error,
  cartItemsCount,
  cartTotalPrice
} = storeToRefs(cartStore);
const {
  fetchCart,
  updateCartItem,
  removeCartItem,
  clearCart,
  checkout
} = cartStore;

// Инициализация тостов
const toast = useToast();

// Форматирование валюты
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

// Склонение слова "товар"
const getItemsDeclension = (count: number): string => {
  const mod10 = count % 10;
  const mod100 = count % 100;
  
  if (mod100 >= 11 && mod100 <= 14) return 'товаров';
  if (mod10 === 1) return 'товар';
  if (mod10 >= 2 && mod10 <= 4) return 'товара';
  return 'товаров';
};

// Загрузка данных корзины при монтировании
const fetchCartData = async () => {
  await fetchCart();
};

onMounted(() => {
  fetchCartData();
});

// Обновление количества товара
const updateQuantity = async (itemId: number, quantity: number) => {
  if (quantity < 1) return;
  
  const success = await updateCartItem(itemId, quantity);
  if (success) {
    toast.add({
      title: 'Корзина обновлена',
      description: 'Количество товара изменено',
      icon: 'i-heroicons-check-circle',
      color: 'success'
    });
  }
};

// Удаление товара
const removeItem = async (itemId: number) => {
  if (import.meta.client) {
    const confirmed = window.confirm('Удалить товар из корзины?');
    if (!confirmed) return;
  }
  
  const success = await removeCartItem(itemId);
  if (success) {
    toast.add({
      title: 'Товар удален',
      description: 'Товар удален из корзины',
      icon: 'i-heroicons-trash',
      color: 'error'
    });
  }
};

// Очистка корзины
const handleClearCart = async () => {
  const success = await clearCart();
  if (success) {
    toast.add({
      title: 'Корзина очищена',
      description: 'Все товары удалены из корзины',
      icon: 'i-heroicons-trash',
      color: 'primary'
    });
  }
};

// Оформление заказа
const handleCheckout = async () => {
  if (cartItemsCount.value === 0) {
    toast.add({
      title: 'Пустая корзина',
      description: 'Добавьте товары в корзину перед оформлением заказа',
      icon: 'i-heroicons-exclamation-triangle',
      color: 'primary'
    });
    return;
  }

  try {
    const result = await checkout();
    if (result?.order_id) {
      toast.add({
        title: 'Заказ оформлен',
        description: `Ваш заказ #${result.order_id} успешно создан`,
        icon: 'i-heroicons-check-circle',
        color: 'success'
      });
      
      // Перенаправляем на страницу заказа
      await navigateTo(`/orders/${result.order_id}`);
    } else if (result?.next_step) {
      // Если бэкенд вернул URL для следующего шага
      window.location.href = result.next_step;
    }
  } catch (err) {
    console.error('Checkout error:', err);
    toast.add({
      title: 'Ошибка оформления',
      description: 'Не удалось оформить заказ. Попробуйте позже.',
      icon: 'i-heroicons-exclamation-triangle',
      color: 'error'
    });
  }
};
</script>

<style scoped>
.cart-container {
  background: linear-gradient(
    135deg,
    var(--color-bg-950) 0%,
    color-mix(in srgb, var(--color-bg-950) 68%, var(--color-surface-900)) 100%
  );
}
</style>
