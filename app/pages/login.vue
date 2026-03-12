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
                    Введите данные для входа
                </p>
            </div>

            <UCard class="p-8 space-y-6">
                <form @submit.prevent="handleLogin" class="space-y-6">
                    <!-- Имя пользователя / email -->
                    <div>
                        <label
                            for="username"
                            class="block text-sm font-medium text-text-100 mb-2"
                        >
                            Имя пользователя или email
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
                        class="text-red-600"
                        :title="error"
                    >
                    </UAlert>

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
                    <p class="text-text-400 text-sm">Нет аккаунта?</p>
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
    middleware: 'guest',
});

const { login } = useAuthStore();

const form = reactive({
    username: '',
    password: '',
});

const loading = ref(false);
const error = ref('');

const handleLogin = async () => {
    loading.value = true;
    error.value = '';

    try {
        const result = await login({
            username: form.username,
            password: form.password,
        });

        if (result.success) {
            await navigateTo('/profile');
        } else {
            error.value = 'Ошибка входа';
            console.log('error.value', error.value);
        }
    } catch (err) {
        error.value = 'Ошибка сервера. Попробуйте позже.';
        console.error('Login error:', err);
    } finally {
        loading.value = false;
    }
};
</script>

<style scoped>
/* Кастомные стили только если нужны */
.login-container {
    background: linear-gradient(
        135deg,
        var(--color-bg-950) 0%,
        var(--color-surface-900) 100%
    );
}
</style>
