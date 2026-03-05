// app/stores/cart.ts
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import useApi from '~/composables/useApi';
import type { CartItem, CartState } from '~/types/cart';

export const useCartStore = defineStore('cart', () => {
  const api = useApi();

  // Состояние
  const cart = ref<CartState | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);

  // ✅ Вычисляемые свойства (на основе реальных данных из API)
  const cartItemsCount = computed(() => {
    if (!cart.value) return 0;
    // Если сервер присылает total_items — используем его, иначе вычисляем
    return cart.value.total_items ?? cart.value.items.reduce((sum, item) => sum + item.quantity, 0);
  });

  const cartTotalPrice = computed(() => {
    if (!cart.value) return 0;
    // Если сервер присылает total_price — используем его, иначе вычисляем
    if (cart.value.total_price !== undefined) {
      return cart.value.total_price;
    }
    return cart.value.items.reduce((sum, item) => {
      const price = parseFloat(item.variant_price) || 0;
      return sum + price * item.quantity;
    }, 0);
  });

  // ============================================
  // Получить содержимое корзины
  // ============================================
  const fetchCart = async () => {
    try {
      loading.value = true;
      error.value = null;

      const { data } = await api.get('/v1/cart/');
      
      // ✅ Добавляем вычисляемые поля для удобства использования
      const enrichedCart: CartState = {
        ...data,
        total_items: data.items.reduce((sum: number, item: CartItem) => sum + item.quantity, 0),
        total_price: data.items.reduce((sum: number, item: CartItem) => {
          const price = parseFloat(item.variant_price) || 0;
          return sum + price * item.quantity;
        }, 0),
      };

      cart.value = enrichedCart;
      return cart.value;
    } catch (err: any) {
      handleError(err, 'Не удалось загрузить корзину');
      return null;
    } finally {
      loading.value = false;
    }
  };

  // ============================================
  // Добавить товар в корзину
  // ============================================
  const addToCart = async (variantId: number, quantity = 1) => {
    try {
      loading.value = true;
      error.value = null;

      const { data } = await api.post('/v1/cart/add_item/', {
        variant_id: variantId,
        quantity,
      });

      // ✅ Обогащаем ответ вычисляемыми полями
      const enrichedCart: CartState = {
        ...data,
        total_items: data.items.reduce((sum: number, item: CartItem) => sum + item.quantity, 0),
        total_price: data.items.reduce((sum: number, item: CartItem) => {
          const price = parseFloat(item.variant_price) || 0;
          return sum + price * item.quantity;
        }, 0),
      };

      cart.value = enrichedCart;

      showNotification({
        title: 'Товар добавлен',
        description: 'Товар успешно добавлен в корзину',
        type: 'success',
      });

      return true;
    } catch (err: any) {
      handleError(err, 'Не удалось добавить товар в корзину');
      return false;
    } finally {
      loading.value = false;
    }
  };

  // ============================================
  // Обновить количество товара
  // ============================================
  const updateCartItem = async (cartItemId: number, quantity: number) => {
    try {
      loading.value = true;
      error.value = null;

      const { data } = await api.post('/v1/cart/update_item/', {
        item_id: cartItemId, // ← ВАЖНО: это ID элемента корзины (не варианта!)
        quantity,
      });

      const enrichedCart: CartState = {
        ...data,
        total_items: data.items.reduce((sum: number, item: CartItem) => sum + item.quantity, 0),
        total_price: data.items.reduce((sum: number, item: CartItem) => {
          const price = parseFloat(item.variant_price) || 0;
          return sum + price * item.quantity;
        }, 0),
      };

      cart.value = enrichedCart;

      showNotification({
        title: 'Корзина обновлена',
        description: 'Количество товара изменено',
        type: 'success',
      });

      return true;
    } catch (err: any) {
      handleError(err, 'Не удалось обновить количество товара');
      return false;
    } finally {
      loading.value = false;
    }
  };

  // ============================================
  // Удалить товар из корзины
  // ============================================
  const removeCartItem = async (cartItemId: number) => {
    try {
      loading.value = true;
      error.value = null;

      const { data } = await api.delete('/v1/cart/remove_item/', 
         { item_id: cartItemId }, // ← ID элемента корзины
      );

      const enrichedCart: CartState = {
        ...data,
        total_items: data.items.reduce((sum: number, item: CartItem) => sum + item.quantity, 0),
        total_price: data.items.reduce((sum: number, item: CartItem) => {
          const price = parseFloat(item.variant_price) || 0;
          return sum + price * item.quantity;
        }, 0),
      };

      cart.value = enrichedCart;

      showNotification({
        title: 'Товар удален',
        description: 'Товар удален из корзины',
        type: 'success',
      });

      return true;
    } catch (err: any) {
      handleError(err, 'Не удалось удалить товар из корзины');
      return false;
    } finally {
      loading.value = false;
    }
  };

  // ============================================
  // Очистить корзину
  // ============================================
  const clearCart = async () => {
    if (process.client) {
      const confirmed = window.confirm('Вы уверены, что хотите очистить корзину?');
      if (!confirmed) return false;
    }

    try {
      loading.value = true;
      error.value = null;

      const { data } = await api.delete('/v1/cart/clear/');
      
      const enrichedCart: CartState = {
        ...data,
        total_items: 0,
        total_price: 0,
      };

      cart.value = enrichedCart;

      showNotification({
        title: 'Корзина очищена',
        description: 'Все товары удалены из корзины',
        type: 'success',
      });

      return true;
    } catch (err: any) {
      handleError(err, 'Не удалось очистить корзину');
      return false;
    } finally {
      loading.value = false;
    }
  };

  // ============================================
  // Оформить заказ
  // ============================================
  const checkout = async () => {
    try {
      loading.value = true;
      error.value = null;

      const { data } = await api.post('/v1/cart/checkout/');

      showNotification({
        title: 'Заказ оформлен',
        description: 'Переход к оформлению заказа',
        type: 'success',
      });

      if (data.next_step && process.client) {
        window.location.href = data.next_step;
      }

      return data;
    } catch (err: any) {
      handleError(err, 'Не удалось оформить заказ');
      return null;
    } finally {
      loading.value = false;
    }
  };

  // ============================================
  // Вспомогательные функции
  // ============================================

  const handleError = (err: any, defaultMessage: string) => {
    error.value = err.message || defaultMessage;

    let errorMessage = defaultMessage;
    if (err.response?.data?.error) {
      errorMessage = err.response.data.error;
    } else if (err.response?.data?.detail) {
      errorMessage = err.response.data.detail;
    } else if (err.response?.status === 401) {
      errorMessage = 'Необходима авторизация';
    } else if (err.response?.status === 404) {
      errorMessage = 'Ресурс не найден';
    } else if (err.response?.status === 400) {
      errorMessage = 'Некорректные данные';
    }

    console.error('Ошибка корзины:', errorMessage, err);
    showNotification({ title: 'Ошибка', description: errorMessage, type: 'error' });
  };

  const showNotification = (notification: {
    title: string;
    description: string;
    type: 'success' | 'error' | 'info';
  }) => {
    if (process.client && window.$nuxt?.$notify) {
      window.$nuxt.$notify({
        title: notification.title,
        message: notification.description,
        type: notification.type,
        duration: 3000,
      });
    } else {
      console.log(`[${notification.type}] ${notification.title}: ${notification.description}`);
    }
  };

  return {
    // Состояние
    cart,
    loading,
    error,

    // ✅ Реактивные геттеры
    cartItemsCount,
    cartTotalPrice,

    // Методы
    fetchCart,
    addToCart,
    updateCartItem,
    removeCartItem,
    clearCart,
    checkout,
  };
});