// app/stores/auth.ts
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export const useAuthStore = defineStore('auth', () => {
    // Состояние
    const tokens = ref<{ access: string; refresh: string } | null>(null);
    const user = ref<any>(null);

    // SSR-safe: отдельные флаги
    const isInitialized = ref(false);
    const initError = ref<string | null>(null);

    const api = useApi();

    // ✅ Основной computed - true только при полном успехе
    const isAuthenticated = computed(() => {
        return !!tokens.value?.access && !!user.value && isInitialized.value;
    });

    // Инициализация (только клиент)
    const initialize = async () => {
        if (!process.client || isInitialized.value) return true;

        try {
            isInitialized.value = false;
            initError.value = null;

            // Читаем токены
            const savedTokens = localStorage.getItem('auth_tokens');
            if (!savedTokens) return false;

            tokens.value = JSON.parse(savedTokens);
            // Проверяем профиль
            const { data } = await api.get('/auth/profile/');
            user.value = data;
            isInitialized.value = true;

            return true;
        } catch (error: any) {
            console.error('Auth init error:', error);
            tokens.value = null;
            user.value = null;
            localStorage.removeItem('auth_tokens');
            initError.value =
                error.response?.data?.detail || 'Ошибка авторизации';
            return false;
        }
    };

    // Логин
    const login = async (credentials: {
        username: string;
        password: string;
    }) => {
        try {
            const { data } = await api.post('/auth/login/', credentials);

            tokens.value = {
                access: data.access,
                refresh: data.refresh,
            };

            // Сохраняем токены
            localStorage.setItem('auth_tokens', JSON.stringify(tokens.value));

            // Загружаем профиль
            const { data: profileData } = await api.get('/auth/profile/');
            user.value = profileData;

            isInitialized.value = true;
            return { success: true };
        } catch (error: any) {
            return {
                success: false,
                error:
                    error.response?.data?.non_field_errors?.[0] ||
                    error.response?.data?.detail ||
                    'Ошибка входа',
            };
        }
    };

    // Логаут
    const logout = async () => {
        try {
            if (tokens.value?.refresh) {
                await api.post(
                    '/auth/logout/',
                    {
                        refresh: tokens.value.refresh,
                    },
                    {
                        headers: { 'Content-Type': 'application/json' }, // ← ЯВНО
                    },
                );
            }
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            tokens.value = null;
            user.value = null;
            isInitialized.value = false;
            localStorage.removeItem('auth_tokens');
            navigateTo('/');
        }
    };

    // Рефреш токена
    const refreshToken = async () => {
        if (!tokens.value?.refresh) return false;

        try {
            const { data } = await api.post('/auth/token/refresh/', {
                refresh: tokens.value.refresh,
            });

            tokens.value = {
                access: data.access,
                refresh: tokens.value.refresh,
            };

            localStorage.setItem('auth_tokens', JSON.stringify(tokens.value));
            return true;
        } catch (error) {
            logout();
            return false;
        }
    };

    // Получить профиль (обновить)
    const fetchProfile = async () => {
        try {
            const { data } = await api.get('/auth/profile/');
            user.value = data;
            return true;
        } catch (error) {
            logout();
            return false;
        }
    };

    return {
        // Состояние
        user,
        tokens,
        isAuthenticated,
        isInitialized,
        initError,

        // Actions
        initialize,
        login,
        logout,
        refreshToken,
        fetchProfile,
    };
});
