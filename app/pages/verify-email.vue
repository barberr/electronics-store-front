<template>
  <div class="verify-container min-h-screen flex items-center justify-center py-2 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8">
      <div>
        <h2 class="mt-6 text-center text-3xl font-bold text-text-100">
          Подтверждение email
        </h2>
        <p class="mt-2 text-center text-text-400 text-sm">
          Введите PIN-код из письма. Код действует 10 минут.
        </p>
      </div>

      <UCard class="p-8 space-y-6">
        <form @submit.prevent="handleVerify" class="space-y-6">
          <div>
            <label
              for="email"
              class="block text-sm font-medium text-text-100 mb-2"
            >
              Email
            </label>
            <UInput
              id="email"
              v-model="form.email"
              type="email"
              size="lg"
              variant="soft"
              placeholder="example@mail.ru"
              :disabled="loading"
              required
            />
          </div>

          <div>
            <label
              for="pin"
              class="block text-sm font-medium text-text-100 mb-2"
            >
              PIN-код
            </label>
            <UInput
              id="pin"
              v-model="form.pin"
              size="lg"
              variant="soft"
              placeholder="123456"
              maxlength="6"
              :disabled="loading"
              required
            />
          </div>

          <UAlert
            v-if="errorMessage"
            icon="i-heroicons-exclamation-triangle"
            color="error"
            variant="soft"
            :title="errorMessage"
          />

          <UButton
            type="submit"
            color="primary"
            size="xl"
            block
            :loading="loading"
            :disabled="loading || !isFormValid"
          >
            Подтвердить email
          </UButton>
        </form>

        <div class="space-y-4 pt-6 border-t border-surface-900">
          <UButton
            color="neutral"
            variant="soft"
            block
            :loading="resending"
            :disabled="resending || !canResend"
            @click="handleResend"
          >
            Отправить PIN повторно
          </UButton>

          <p class="text-center text-text-400 text-sm">
            Уже подтвердили email?
          </p>

          <UButton
            to="/login"
            color="neutral"
            variant="ghost"
            block
          >
            Перейти ко входу
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

const route = useRoute();
const toast = useToast();
const authStore = useAuthStore();

const form = reactive({
  email: typeof route.query.email === 'string' ? route.query.email : '',
  pin: '',
});

const loading = ref(false);
const resending = ref(false);
const errorMessage = ref('');

const isFormValid = computed(() => {
  return form.email.trim().length > 0 && form.pin.trim().length === 6;
});

const canResend = computed(() => {
  return form.email.trim().length > 0;
});

const handleVerify = async () => {
  errorMessage.value = '';
  loading.value = true;

  try {
    const result = await authStore.verifyEmailPin({
      email: form.email,
      pin: form.pin,
    });

    if (result.success) {
      toast.add({
        title: 'Email подтвержден',
        description: 'Аккаунт активирован, выполняем вход',
        color: 'success',
        icon: 'i-heroicons-check-circle'
      });

      await navigateTo('/profile', { replace: true });
      return;
    }

    errorMessage.value = result.error || 'Не удалось подтвердить email';
  } finally {
    loading.value = false;
  }
};

const handleResend = async () => {
  errorMessage.value = '';
  resending.value = true;

  try {
    const result = await authStore.resendEmailPin(form.email);

    if (result.success) {
      toast.add({
        title: 'PIN отправлен повторно',
        description: `Код отправлен на ${result.email || form.email}`,
        color: 'success',
        icon: 'i-heroicons-envelope'
      });
      return;
    }

    errorMessage.value = result.error || 'Не удалось отправить PIN повторно';
  } finally {
    resending.value = false;
  }
};
</script>

<style scoped>
.verify-container {
  background: linear-gradient(
    135deg,
    var(--color-bg-950) 0%,
    color-mix(in srgb, var(--color-bg-950) 68%, var(--color-surface-900)) 100%
  );
}
</style>
