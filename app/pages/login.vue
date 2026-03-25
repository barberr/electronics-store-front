<!-- app/pages/login.vue -->
<template>
  <div
    class="login-container min-h-screen flex items-center justify-center py-2 px-4 sm:px-6 lg:px-8"
  >
    <div class="max-w-md w-full space-y-8">
      <div>
        <h2 class="mt-6 text-center text-3xl font-bold text-text-100">
          Вход в аккаунт
        </h2>
        <p class="mt-2 text-center text-text-400 text-sm">
          Используйте имя пользователя и пароль
        </p>
      </div>

      <UCard class="p-8 space-y-6">
        <form
          class="space-y-6"
          @submit.prevent="handleLogin"
        >
          <!-- Имя пользователя -->
          <div>
            <label
              for="username"
              class="block text-sm font-medium text-text-100 mb-2"
            >
              Имя пользователя
            </label>
            <UInput
              id="username"
              v-model="form.username"
              size="lg"
              variant="soft"
              placeholder="Введите имя пользователя"
              :loading="loading"
              :disabled="loading"
              required
            />
          </div>

          <!-- Пароль -->
          <div>
            <label
              for="password"
              class="block text-sm font-medium text-text-100 mb-2"
            >
              Пароль
            </label>
            <UInput
              id="password"
              v-model="form.password"
              type="password"
              size="lg"
              variant="soft"
              placeholder="••••••••"
              :loading="loading"
              :disabled="loading"
              required
            />
          </div>

          <!-- Ошибка -->
          <UAlert
            v-if="error"
            icon="i-heroicons-exclamation-triangle"
            color="error"
            variant="soft"
            class="text-red-400"
            :title="error"
          />

          <UButton
            v-if="requiresVerification"
            :to="verificationLink"
            color="primary"
            variant="outline"
            block
          >
            Подтвердить email
          </UButton>

          <!-- Кнопка входа -->
          <UButton
            type="submit"
            color="primary"
            size="xl"
            block
            :loading="loading"
            :disabled="loading"
          >
            <template #leading>
              <UIcon name="i-heroicons-arrow-right" />
            </template>
            {{ loading ? 'Входим...' : 'Войти' }}
          </UButton>
        </form>

        <!-- Регистрация -->
        <div class="text-center space-y-4">
          <p class="text-text-400 text-sm">
            Нет аккаунта?
          </p>
          <UButton
            to="/register"
            color="neutral"
            variant="soft"
            block
            size="lg"
          >
            Создать аккаунт
          </UButton>
        </div>
      </UCard>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: 'guest'
})

const { login } = useAuthStore()

const form = reactive({
  username: '',
  password: ''
})

const loading = ref(false)
const error = ref('')

const requiresVerification = computed(() => {
  return error.value === 'Email is not verified'
})

const verificationLink = computed(() => ({
  path: '/verify-email'
}))

const handleLogin = async () => {
  loading.value = true
  error.value = ''

  try {
    const result = await login({
      username: form.username,
      password: form.password
    })

    if (result.success) {
      await navigateTo('/profile')
    } else {
      error.value = result.error || 'Ошибка входа'
    }
  } catch (err) {
    error.value = 'Ошибка сервера. Попробуйте позже.'
    console.error('Login error:', err)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
/* Кастомные стили только если нужны */
.login-container {
    background: linear-gradient(
        135deg,
        var(--color-bg-950) 0%,
        color-mix(in srgb, var(--color-bg-950) 68%, var(--color-surface-900)) 100%
    );
}
</style>
