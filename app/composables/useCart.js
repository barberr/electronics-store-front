// app/composables/useCart.ts
import { storeToRefs } from 'pinia';
import { useCartStore } from '~/stores/cart';

export const useCart = () => {
  const store = useCartStore();

  // ✅ Полная реактивность через storeToRefs
  const {
    cart,
    loading,
    error,
    cartItemsCount,   // ← реактивное вычисляемое свойство
    cartTotalPrice,   // ← реактивное вычисляемое свойство
  } = storeToRefs(store);

  return {
    // Состояние
    cart,
    loading,
    error,

    // ✅ Готовые к использованию реактивные значения
    cartItemsCount,   // number (реактивный)
    cartTotalPrice,   // number (реактивный)

    // Методы
    fetchCart: store.fetchCart,
    addToCart: store.addToCart,
    updateCartItem: store.updateCartItem,
    removeCartItem: store.removeCartItem,
    clearCart: store.clearCart,
    checkout: store.checkout,
  };
};