// composables/useCart.js
import { ref, onMounted } from 'vue'
import useApi from './useApi'

export default function useCart() {
  const api = useApi()
  
  const cart = ref(null)
  const loading = ref(false)
  const error = ref(null)
  
  // ============================================
  // Получить содержимое корзины
  // ============================================
  const fetchCart = async () => {
    try {
      loading.value = true
      error.value = null
      
      const response = await api.get('/v1/cart/')
      cart.value = response.data
      
      return cart.value
    } catch (err) {
      handleError(err, 'Не удалось загрузить корзину')
      return null
    } finally {
      loading.value = false
    }
  }
  
  // ============================================
  // Добавить товар в корзину
  // ============================================
  const addToCart = async (variantId, quantity = 1) => {
    try {
      loading.value = true
      error.value = null
      
      const response = await api.post('/v1/cart/add_item/', {
        variant_id: variantId,
        quantity: quantity
      })
      
      cart.value = response.data
      
      // Показать уведомление об успехе
      showNotification({
        title: 'Товар добавлен',
        description: 'Товар успешно добавлен в корзину',
        type: 'success'
      })
      
      return true
    } catch (err) {
      handleError(err, 'Не удалось добавить товар в корзину')
      return false
    } finally {
      loading.value = false
    }
  }
  
  // ============================================
  // Обновить количество товара в корзине
  // ============================================
  const updateCartItem = async (itemId, quantity) => {
    try {
      loading.value = true
      error.value = null
      
      const response = await api.post('/v1/cart/update_item/', {
        item_id: itemId,
        quantity: quantity
      })
      
      cart.value = response.data
      
      // Показать уведомление об успехе
      showNotification({
        title: 'Корзина обновлена',
        description: 'Количество товара изменено',
        type: 'success'
      })
      
      return true
    } catch (err) {
      handleError(err, 'Не удалось обновить количество товара')
      return false
    } finally {
      loading.value = false
    }
  }
  
  // ============================================
  // Удалить товар из корзины
  // ============================================
  const removeCartItem = async (itemId) => {
    try {
      loading.value = true
      error.value = null
      
      const response = await api.delete('/v1/cart/remove_item/', {
        data: { item_id: itemId }
      })
      
      cart.value = response.data
      
      // Показать уведомление об успехе
      showNotification({
        title: 'Товар удален',
        description: 'Товар удален из корзины',
        type: 'success'
      })
      
      return true
    } catch (err) {
      handleError(err, 'Не удалось удалить товар из корзины')
      return false
    } finally {
      loading.value = false
    }
  }
  
  // ============================================
  // Очистить корзину
  // ============================================
  const clearCart = async () => {
    // Показать подтверждение
    if (typeof window !== 'undefined') {
      const confirmed = window.confirm('Вы уверены, что хотите очистить корзину?')
      if (!confirmed) return false
    }
    
    try {
      loading.value = true
      error.value = null
      
      const response = await api.delete('/v1/cart/clear/')
      cart.value = response.data
      
      // Показать уведомление об успехе
      showNotification({
        title: 'Корзина очищена',
        description: 'Все товары удалены из корзины',
        type: 'success'
      })
      
      return true
    } catch (err) {
      handleError(err, 'Не удалось очистить корзину')
      return false
    } finally {
      loading.value = false
    }
  }
  
  // ============================================
  // Оформить заказ
  // ============================================
  const checkout = async () => {
    try {
      loading.value = true
      error.value = null
      
      const response = await api.post('/v1/cart/checkout/')
      
      // Показать уведомление об успехе
      showNotification({
        title: 'Заказ оформлен',
        description: 'Переход к оформлению заказа',
        type: 'success'
      })
      
      // Если сервер вернул редирект
      if (response.data.next_step) {
        if (typeof window !== 'undefined') {
          window.location.href = response.data.next_step
        }
      }
      
      return response.data
    } catch (err) {
      handleError(err, 'Не удалось оформить заказ')
      return null
    } finally {
      loading.value = false
    }
  }
  
  // ============================================
  // Получить общее количество товаров в корзине
  // ============================================
  const getTotalItems = () => {
    if (!cart.value) return 0
    return cart.value.total_items || 0
  }
  
  // ============================================
  // Получить общую стоимость корзины
  // ============================================
  const getTotalPrice = () => {
    if (!cart.value) return 0
    return cart.value.total_price || 0
  }
  
  // ============================================
  // Вспомогательные функции
  // ============================================
  
  /**
   * Обработка ошибок
   */
  const handleError = (err, defaultMessage = 'Произошла ошибка') => {
    error.value = err
    
    // Извлекаем сообщение об ошибке из ответа
    let errorMessage = defaultMessage
    
    if (err.response) {
      // Ошибка от сервера
      if (err.response.data && err.response.data.error) {
        errorMessage = err.response.data.error
      } else if (err.response.data && err.response.data.detail) {
        errorMessage = err.response.data.detail
      } else if (err.response.status === 401) {
        errorMessage = 'Необходима авторизация'
      } else if (err.response.status === 404) {
        errorMessage = 'Ресурс не найден'
      } else if (err.response.status === 400) {
        errorMessage = 'Некорректные данные'
      }
    } else if (err.message) {
      // Сетевая ошибка или таймаут
      errorMessage = err.message
    }
    
    console.error('Ошибка:', errorMessage, err)
    
    // Показать уведомление об ошибке
    showNotification({
      title: 'Ошибка',
      description: errorMessage,
      type: 'error'
    })
  }
  
  /**
   * Показать уведомление
   */
  const showNotification = (notification) => {
    // Используем Nuxt useNotification если доступен
    if (typeof useNotification !== 'undefined') {
      useNotification(notification)
    } else if (typeof window !== 'undefined' && window.$nuxt) {
      // Альтернативный способ через $nuxt
      window.$nuxt.$notify({
        title: notification.title,
        message: notification.description,
        type: notification.type || 'info',
        duration: 3000
      })
    } else {
      // Fallback для консоли
      console.log(`${notification.type}: ${notification.title} - ${notification.description}`)
    }
  }
  
  // ============================================
  // Инициализация
  // ============================================
  onMounted(() => {
    // Загружаем корзину при монтировании
    fetchCart()
  })
  
  // ============================================
  // Возвращаем публичный интерфейс
  // ============================================
  return {
    // Состояние
    cart,
    loading,
    error,
    
    // Методы
    fetchCart,
    addToCart,
    updateCartItem,
    removeCartItem,
    clearCart,
    checkout,
    
    // Геттеры
    getTotalItems,
    getTotalPrice,
    
    // Утилиты
    handleError
  }
}