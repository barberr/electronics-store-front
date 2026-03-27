<template>
  <div class="checkout-page py-8 px-4 sm:px-6 lg:px-8">
    <div class="max-w-7xl mx-auto">
      <div class="mb-10 text-center">
        <p class="text-sm uppercase tracking-[0.2em] text-text-400 mb-3">
          Checkout
        </p>
        <h1 class="text-3xl md:text-4xl font-bold text-text-100 mb-3">
          Оформление заказа
        </h1>
        <p class="text-text-400 text-lg max-w-2xl mx-auto">
          Укажите контактные данные, а мы быстро подтвердим заказ и уточним
          детали оплаты и получения.
        </p>
      </div>

      <div
        v-if="loading && !cart"
        class="flex justify-center py-12"
      >
        <div class="text-center">
          <div class="w-12 h-12 border-4 border-text-100 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p class="text-text-400">Загружаем корзину...</p>
        </div>
      </div>

      <div
        v-else-if="!cart || cart.items.length === 0"
        class="max-w-3xl mx-auto"
      >
        <UCard class="p-10 text-center border border-surface-900 bg-[linear-gradient(180deg,color-mix(in_srgb,var(--color-surface-900)_16%,transparent)_0%,transparent_100%)]">
          <div class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-surface-900 mx-auto mb-6">
            <UIcon name="i-heroicons-shopping-bag" class="text-3xl text-text-400" />
          </div>
          <h2 class="text-2xl font-bold text-text-100 mb-3">
            Оформлять пока нечего
          </h2>
          <p class="text-text-400 mb-8 max-w-md mx-auto">
            В корзине нет товаров. Вернитесь в каталог или добавьте позиции в
            корзину перед оформлением заказа.
          </p>
          <div class="flex flex-col sm:flex-row justify-center gap-4">
            <UButton
              to="/cart"
              color="neutral"
              variant="outline"
              class="app-btn-secondary"
            >
              Вернуться в корзину
            </UButton>
            <UButton
              to="/"
              color="primary"
              class="app-btn-primary"
            >
              Перейти к покупкам
            </UButton>
          </div>
        </UCard>
      </div>

      <div
        v-else
        class="grid grid-cols-1 xl:grid-cols-[minmax(0,1.3fr)_minmax(320px,0.7fr)] gap-8"
      >
        <div class="space-y-8">
          <UCard class="p-6 md:p-8 border border-surface-900 bg-[linear-gradient(180deg,color-mix(in_srgb,var(--color-surface-900)_18%,transparent)_0%,transparent_100%)]">
            <div class="flex items-start justify-between gap-4 mb-8">
              <div>
                <h2 class="text-2xl font-bold text-text-100 mb-2">
                  Контактные данные
                </h2>
                <p class="text-text-400">
                  Используем их только для подтверждения и сопровождения заказа.
                </p>
              </div>
              <div class="hidden md:flex items-center rounded-full border border-surface-700 bg-bg-950/70 px-3 py-1 text-[11px] uppercase tracking-[0.14em] text-text-400">
                Шаг 1 из 1
              </div>
            </div>

            <form class="space-y-6" @submit.prevent="handlePlaceOrder">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label class="checkout-label" for="name">Имя</label>
                  <UInput
                    id="name"
                    v-model="form.name"
                    size="lg"
                    variant="soft"
                    placeholder="Как к вам обращаться"
                    :disabled="loading"
                  />
                </div>
                <div>
                  <label class="checkout-label" for="phone">Телефон</label>
                  <UInput
                    id="phone"
                    v-model="form.phone"
                    size="lg"
                    variant="soft"
                    placeholder="+7 (___) ___-__-__"
                    :disabled="loading"
                  />
                </div>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label class="checkout-label" for="contactMethod">Способ связи</label>
                  <select
                    id="contactMethod"
                    v-model="form.contactMethod"
                    class="checkout-control"
                    :disabled="loading"
                  >
                    <option value="phone">Звонок</option>
                    <option value="telegram">Telegram</option>
                    <option value="whatsapp">WhatsApp</option>
                  </select>
                </div>
                <div>
                  <label class="checkout-label" for="email">Email</label>
                  <UInput
                    id="email"
                    v-model="form.email"
                    size="lg"
                    variant="soft"
                    placeholder="name@example.com"
                    :disabled="loading"
                  />
                </div>
              </div>

              <div>
                <label class="checkout-label" for="city">Город</label>
                <UInput
                  id="city"
                  v-model="form.city"
                  size="lg"
                  variant="soft"
                  placeholder="Псков"
                  :disabled="loading"
                />
              </div>

              <div>
                <label class="checkout-label" for="comment">Комментарий к заказу</label>
                <textarea
                  id="comment"
                  v-model="form.comment"
                  class="checkout-control checkout-control_textarea"
                  placeholder="Например: нужна настройка iPhone, перенос данных и стекло"
                  :disabled="loading"
                  rows="5"
                />
              </div>

              <UAlert
                v-if="errorMessage"
                icon="i-heroicons-exclamation-triangle"
                color="error"
                variant="soft"
                :title="errorMessage"
              />

              <div class="rounded-2xl border border-surface-900 bg-surface-900/40 p-5">
                <h3 class="text-text-100 font-semibold mb-3">
                  Что будет дальше
                </h3>
                <ul class="space-y-2 text-text-400">
                  <li>Проверим состав заказа и подтвердим наличие.</li>
                  <li>Свяжемся удобным способом для уточнения деталей.</li>
                  <li>Согласуем оплату, получение и дополнительные услуги.</li>
                </ul>
              </div>

              <div class="flex flex-col sm:flex-row gap-4 pt-2">
                <UButton
                  to="/cart"
                  color="neutral"
                  variant="outline"
                  class="app-btn-secondary"
                  :disabled="loading"
                >
                  Назад в корзину
                </UButton>
                <UButton
                  type="submit"
                  color="primary"
                  class="app-btn-primary flex-1"
                  :loading="loading"
                  :disabled="loading"
                >
                  {{ loading ? 'Оформляем заказ...' : 'Подтвердить заказ' }}
                </UButton>
              </div>
            </form>
          </UCard>
        </div>

        <div class="space-y-6">
          <UCard class="p-6 sticky top-8 border border-surface-900 bg-[linear-gradient(180deg,color-mix(in_srgb,var(--color-surface-900)_22%,transparent)_0%,transparent_100%)]">
            <h2 class="text-xl font-bold text-text-100 mb-6">
              Состав заказа
            </h2>

            <div class="space-y-4 mb-6">
              <div
                v-for="item in cart.items"
                :key="item.id"
                class="flex items-start justify-between gap-4 border-b border-surface-900 pb-4 last:border-b-0 last:pb-0"
              >
                <div class="min-w-0">
                  <p class="font-medium text-text-100">
                    {{ item.variant_name }}
                  </p>
                  <p class="text-sm text-text-400">
                    {{ item.quantity }} {{ getItemsDeclension(item.quantity) }}
                  </p>
                </div>
                <p class="font-semibold text-text-100 whitespace-nowrap">
                  {{ formatCurrency(parseFloat(item.variant_price) * item.quantity) }}
                </p>
              </div>
            </div>

            <div class="space-y-3 border-t border-surface-900 pt-5">
              <div class="flex items-center justify-between text-text-100">
                <span>Товары</span>
                <span>{{ formatCurrency(cartTotalPrice) }}</span>
              </div>
              <div class="flex items-center justify-between text-text-100">
                <span>Доставка</span>
                <span class="text-text-400">Уточняется</span>
              </div>
              <div class="flex items-center justify-between text-lg font-bold text-text-100 pt-2">
                <span>Итого</span>
                <span>{{ formatCurrency(cartTotalPrice) }}</span>
              </div>
            </div>
          </UCard>

          <UCard class="p-6 border border-surface-900 bg-[linear-gradient(180deg,color-mix(in_srgb,var(--color-surface-900)_14%,transparent)_0%,transparent_100%)]">
            <h3 class="text-lg font-semibold text-text-100 mb-3">
              Поддержка перед покупкой
            </h3>
            <div class="space-y-3 text-text-400">
              <p>Если нужно подобрать конфигурацию, мы поможем до оформления.</p>
              <a class="checkout-link" href="tel:+79517505749">
                +7 (951) 750-57-49
              </a>
              <a
                class="checkout-link"
                href="https://t.me/izistore_price"
                target="_blank"
                rel="noopener noreferrer"
              >
                Telegram-канал
              </a>
            </div>
          </UCard>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia'

definePageMeta({
  middleware: 'auth',
})

const authStore = useAuthStore()
const cartStore = useCartStore()
const { user } = storeToRefs(authStore)
const { cart, loading, cartTotalPrice } = storeToRefs(cartStore)
const { fetchCart, checkout } = cartStore
const toast = useToast()

const form = reactive({
  name: '',
  phone: '',
  email: '',
  city: '',
  contactMethod: 'phone',
  comment: '',
})

const errorMessage = ref('')

const prefillCheckoutForm = () => {
  const profile = user.value
  if (!profile) return

  const fullName = [profile.first_name, profile.last_name]
    .filter(Boolean)
    .join(' ')
    .trim()

  form.name = fullName || profile.username || ''
  form.phone
    = profile.phone
      || profile.phone_number
      || profile.mobile
      || ''
  form.email = profile.email || ''
}

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

const getItemsDeclension = (count: number): string => {
  const mod10 = count % 10
  const mod100 = count % 100

  if (mod100 >= 11 && mod100 <= 14) return 'товаров'
  if (mod10 === 1) return 'шт.'
  if (mod10 >= 2 && mod10 <= 4) return 'шт.'
  return 'шт.'
}

onMounted(async () => {
  prefillCheckoutForm()

  if (!cart.value) {
    await fetchCart()
  }
})

const handlePlaceOrder = async () => {
  errorMessage.value = ''

  if (!form.name.trim()) {
    errorMessage.value = 'Укажите имя для подтверждения заказа'
    return
  }

  if (!form.phone.trim()) {
    errorMessage.value = 'Укажите номер телефона для связи'
    return
  }

  if (!cart.value?.items.length) {
    errorMessage.value = 'Корзина пуста. Добавьте товары перед оформлением.'
    return
  }

  try {
    const result = await checkout()

    if (result?.order_id) {
      toast.add({
        title: 'Заказ оформлен',
        description: `Ваш заказ #${result.order_id} успешно создан`,
        icon: 'i-heroicons-check-circle',
        color: 'success',
      })

      await navigateTo('/profile')
      return
    }

    if (!result?.next_step) {
      toast.add({
        title: 'Заявка отправлена',
        description: 'Мы свяжемся с вами для подтверждения заказа',
        icon: 'i-heroicons-check-circle',
        color: 'success',
      })
    }
  } catch (err) {
    console.error('Checkout page error:', err)
    errorMessage.value = 'Не удалось оформить заказ. Попробуйте еще раз.'
  }
}
</script>

<style scoped>
.checkout-page {
  background: linear-gradient(
    135deg,
    var(--color-bg-950) 0%,
    color-mix(in srgb, var(--color-bg-950) 68%, var(--color-surface-900)) 100%
  );
}

.checkout-label {
  display: block;
  margin-bottom: 0.75rem;
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--color-text-100);
}

.checkout-control {
  width: 100%;
  padding: 0.9rem 1rem;
  border: 1px solid color-mix(in srgb, var(--color-text-400) 28%, transparent);
  border-radius: 0.875rem;
  background: color-mix(in srgb, var(--color-surface-900) 74%, var(--color-bg-950));
  color: var(--color-text-100);
}

.checkout-control_textarea {
  resize: vertical;
  min-height: 8rem;
}

.checkout-link {
  display: inline-flex;
  width: fit-content;
  text-decoration: none;
}
</style>
