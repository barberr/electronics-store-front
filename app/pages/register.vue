<!-- app/pages/register.vue -->
<template>
  <div
    class="register-container min-h-screen flex items-center justify-center py-2 px-4 sm:px-6 lg:px-8"
  >
    <div class="max-w-md w-full space-y-8">
      <div>
        <h2 class="mt-6 text-center text-3xl font-bold text-text-100">
          Создание аккаунта
        </h2>
        <p class="mt-2 text-center text-text-400 text-sm">
          Заполните форму для регистрации
        </p>
      </div>

      <UCard class="p-8 space-y-6">
        <form @submit.prevent="handleRegister" class="space-y-6">
          <!-- Имя пользователя -->
          <div>
            <label
              for="username"
              class="block text-sm font-medium text-text-100 mb-2"
            >
              Имя пользователя *
            </label>
            <UInput
              id="username"
              v-model="form.username"
              size="lg"
              variant="soft"
              placeholder="Введите имя пользователя"
              :error="!!fieldErrors.username"
              :disabled="loading"
              required
            />
            <p v-if="fieldErrors.username" class="mt-1 text-sm text-red-400">
              {{ fieldErrors.username[0] }}
            </p>
          </div>

          <!-- Email -->
          <div>
            <label
              for="email"
              class="block text-sm font-medium text-text-100 mb-2"
            >
              Email *
            </label>
            <UInput
              id="email"
              v-model="form.email"
              type="email"
              size="lg"
              variant="soft"
              placeholder="example@mail.ru"
              :error="!!fieldErrors.email"
              :disabled="loading"
              required
            />
            <p v-if="fieldErrors.email" class="mt-1 text-sm text-red-400">
              {{ fieldErrors.email[0] }}
            </p>
          </div>

          <!-- Пароль -->
          <div>
            <label
              for="password"
              class="block text-sm font-medium text-text-100 mb-2"
            >
              Пароль *
            </label>
            <UInput
              id="password"
              v-model="form.password"
              type="password"
              size="lg"
              variant="soft"
              placeholder="••••••••"
              :error="!!fieldErrors.password"
              :disabled="loading"
              required
            />
            <p v-if="fieldErrors.password" class="mt-1 text-sm text-red-400">
              {{ Array.isArray(fieldErrors.password) ? fieldErrors.password.join(', ') : fieldErrors.password }}
            </p>
          </div>

          <!-- Подтверждение пароля -->
          <div>
            <label
              for="password2"
              class="block text-sm font-medium text-text-100 mb-2"
            >
              Подтвердите пароль *
            </label>
            <UInput
              id="password2"
              v-model="form.password2"
              type="password"
              size="lg"
              variant="soft"
              placeholder="••••••••"
              :error="passwordMismatch"
              :disabled="loading"
              required
            />
            <p v-if="passwordMismatch" class="mt-1 text-sm text-red-400">
              Пароли не совпадают
            </p>
          </div>

          <!-- Имя и фамилия (опционально) -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                for="first_name"
                class="block text-sm font-medium text-text-100 mb-2"
              >
                Имя
              </label>
              <UInput
                id="first_name"
                v-model="form.first_name"
                size="lg"
                variant="soft"
                placeholder="Иван"
                :disabled="loading"
              />
            </div>
            <div>
              <label
                for="last_name"
                class="block text-sm font-medium text-text-100 mb-2"
              >
                Фамилия
              </label>
              <UInput
                id="last_name"
                v-model="form.last_name"
                size="lg"
                variant="soft"
                placeholder="Иванов"
                :disabled="loading"
              />
            </div>
          </div>

          <!-- Общая ошибка -->
          <UAlert
            v-if="errorMessage"
            icon="i-heroicons-exclamation-triangle"
            color="error"
            variant="soft"
            class="text-red-400"
            :title="errorMessage"
          />

          <!-- Кнопка регистрации -->
          <UButton
            type="submit"
            color="primary"
            size="xl"
            block
            :loading="loading"
            :disabled="loading || isFormInvalid"
          >
            <template #leading>
              <UIcon name="i-heroicons-user-plus" />
            </template>
            {{ loading ? 'Создаем аккаунт...' : 'Зарегистрироваться' }}
          </UButton>
        </form>

        <!-- Вход -->
        <div class="text-center space-y-4 pt-6 border-t border-surface-900">
          <p class="text-text-400 text-sm">Уже есть аккаунт?</p>
          <UButton
            to="/login"
            color="neutral"
            variant="soft"
            block
            size="lg"
          >
            Войти в аккаунт
          </UButton>
        </div>
      </UCard>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: 'guest',
});

const toast = useToast()
const authStore = useAuthStore();

const form = reactive({
  username: '',
  email: '',
  password: '',
  password2: '',
  first_name: '',
  last_name: '',
});

const loading = ref(false);
const errorMessage = ref('');
const fieldErrors = ref<Record<string, string[]>>({});

// Валидация совпадения паролей
const passwordMismatch = computed(() => {
  return Boolean(form.password && form.password2 && form.password !== form.password2);
});

// Валидация формы для отключения кнопки
const isFormInvalid = computed(() => {
  return (
    !form.username.trim() ||
    !form.email.trim() ||
    !form.password ||
    !form.password2 ||
    passwordMismatch.value
  );
});

const handleRegister = async () => {
  // Сброс ошибок
  errorMessage.value = '';
  fieldErrors.value = {};
  
  // Клиентская валидация паролей
  if (passwordMismatch.value) {
    errorMessage.value = 'Пароли не совпадают';
    return;
  }

  loading.value = true;

  try {
    const result = await authStore.register({
      username: form.username,
      email: form.email,
      password: form.password,
      password2: form.password2,
      first_name: form.first_name,
      last_name: form.last_name,
    });

    if (result.success) {
      toast.add({
        title: 'Регистрация завершена',
        description: result.message || 'Мы отправили PIN-код на ваш email',
        color: 'success',
        icon: 'i-heroicons-check-circle'
      });

      await navigateTo({
        path: '/verify-email',
        query: {
          email: result.email || form.email
        }
      }, { replace: true });
    } else {
      errorMessage.value = result.error || 'Не удалось создать аккаунт';
      
      // Устанавливаем ошибки полей для отображения под инпутами
      if (result.errors) {
        fieldErrors.value = result.errors;
      }
      // Показываем уведомление об ошибке
        toast.add({
        title: 'Ошибка',
        description: 'Не удалось зарегистрироваться. Попробуйте позже.',
        color: 'error',
        icon: 'i-heroicons-exclamation-triangle'
        });
    }
  } catch (err: any) {
    console.error('Unexpected registration error:', err);
    errorMessage.value = 'Ошибка сервера. Попробуйте позже.';
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.register-container {
  background: linear-gradient(
    135deg,
    var(--color-bg-950) 0%,
    color-mix(in srgb, var(--color-bg-950) 68%, var(--color-surface-900)) 100%
  );
}
</style>
