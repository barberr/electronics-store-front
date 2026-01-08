<!-- app/pages/login.vue -->
<template>
    <div class="login-container">
        <h1>Вход в аккаунт</h1>

        <form @submit.prevent="handleLogin" :class="{ loading: loading }">
            <div class="form-group">
                <label for="username">Имя пользователя или email</label>
                <input
                    id="username"
                    v-model="form.username"
                    type="text"
                    required
                    :disabled="loading"
                    placeholder="Введите имя пользователя"
                />
            </div>

            <div class="form-group">
                <label for="password">Пароль</label>
                <input
                    id="password"
                    v-model="form.password"
                    type="password"
                    required
                    :disabled="loading"
                    placeholder="Введите пароль"
                />
            </div>

            <button type="submit" :disabled="loading">
                {{ loading ? 'Вход...' : 'Войти' }}
            </button>

            <p v-if="error" class="error">{{ error }}</p>

            <p class="link">
                Нет аккаунта?
                <NuxtLink to="/">Зарегистрироваться</NuxtLink>
            </p>
        </form>
    </div>
</template>

<script setup lang="ts">
definePageMeta({
    middleware: 'guest',
});
import { reactive, ref } from 'vue';
import { useRouter } from 'vue-router';

const { login, user } = useAuth();
const router = useRouter();

const form = reactive({
    username: '',
    password: '',
});

const loading = ref(false);
const error = ref('');

const handleLogin = async () => {
    loading.value = true;
    error.value = '';

    const result = await login({
        username: form.username,
        password: form.password,
    });
    // console.log('result', result.success);

    if (result.success) {
        console.log('✅ Успешный вход, user:', user.value);
        await router.push('/profile');
    } else {
        error.value =
            typeof result.error === 'string'
                ? result.error
                : JSON.stringify(result.error); // на случай, если error — объект
    }

    loading.value = false;
};
</script>

<style scoped>
.login-container {
    max-width: 400px;
    margin: 2rem auto;
    padding: 1.5rem;
    border: 1px solid #ddd;
    border-radius: 8px;
    background: #f9f9f9;
}

h1 {
    text-align: center;
    margin-bottom: 1.5rem;
}

.form-group {
    margin-bottom: 1rem;
}

label {
    display: block;
    margin-bottom: 0.25rem;
    font-weight: bold;
}

input {
    width: 100%;
    padding: 0.5rem;
    border: 1px solid #ccc;
    border-radius: 4px;
    font-size: 1rem;
}

button {
    width: 100%;
    padding: 0.75rem;
    background: #1d4ed8;
    color: white;
    border: none;
    border-radius: 4px;
    font-size: 1rem;
    cursor: pointer;
}

button:disabled {
    background: #9ca3af;
    cursor: not-allowed;
}

.error {
    color: #e53e3e;
    margin-top: 0.5rem;
    text-align: center;
}

.link {
    text-align: center;
    margin-top: 1rem;
}

.link a {
    color: #1d4ed8;
    text-decoration: none;
}

.link a:hover {
    text-decoration: underline;
}
</style>
