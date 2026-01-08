// electronics-store-front/app/composables/useAuth.ts

interface AuthUser {
    date_joined: string;
    id: number;
    username: string;
    email: string;
    first_name?: string;
    last_name?: string;
}

interface AuthTokens {
    access: string;
    refresh: string;
}

const TOKENS_KEY = 'auth_tokens';

export const useAuth = () => {
    const api = useApi();

    // Восстанавливаем токены из localStorage при инициализации
    const tokens = ref<AuthTokens | null>(null);
    if (import.meta.client) {
        const saved = localStorage.getItem(TOKENS_KEY);
        console.log('adfS', saved);
        if (saved) {
            try {
                tokens.value = JSON.parse(saved);
            } catch (e) {
                console.error('Ошибка парсинга токенов из localStorage', e);
                localStorage.removeItem(TOKENS_KEY);
            }
        }
    }

    const user = ref<AuthUser | null>(null);
    const isAuthenticated = computed(
        () => !!tokens.value?.access && !!user.value,
    );

    // Сохраняем/удаляем токены при изменении
    watch(
        tokens,
        (newTokens) => {
            if (!process.client) return;
            if (newTokens) {
                localStorage.setItem(TOKENS_KEY, JSON.stringify(newTokens));
            } else {
                localStorage.removeItem(TOKENS_KEY);
            }
        },
        { deep: false }, // можно добавить, но необязательно
    );

    const fetchProfile = async () => {
        try {
            console.log('🔍 Запрос профиля с токеном:', tokens.value?.access);
            const { data } = await api.get('/auth/profile/');
            user.value = data;
            console.log('✅ Профиль загружен:', data);
        } catch (error: any) {
            console.error(
                '❌ Ошибка fetchProfile:',
                error.response?.data || error.message,
            );
            user.value = null;
            tokens.value = null;
        }
    };

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
            await fetchProfile();
            return { success: true };
        } catch (error: any) {
            return {
                success: false,
                error: error.response?.data || 'Ошибка входа',
            };
        }
    };

    const register = async (userData: {
        username: string;
        email: string;
        password: string;
    }) => {
        try {
            await api.post('/auth/register/', userData);
            return await login({
                username: userData.username,
                password: userData.password,
            });
        } catch (error: any) {
            return {
                success: false,
                error: error.response?.data || 'Ошибка регистрации',
            };
        }
    };

    const refreshToken = async () => {
        if (!tokens.value?.refresh) {
            tokens.value = null;
            user.value = null;
            return false;
        }

        try {
            const { data } = await api.post('/auth/token/refresh/', {
                refresh: tokens.value.refresh,
            });
            tokens.value = {
                access: data.access,
                refresh: tokens.value.refresh, // refresh токен обычно не меняется при обновлении access, но в вашем кастомном эндпоинте — да
            };
            return true;
        } catch (error) {
            tokens.value = null;
            user.value = null;
            return false;
        }
    };

    const logout = async () => {
        try {
            if (tokens.value?.refresh) {
                await api.post('/auth/logout/', {
                    refresh: tokens.value.refresh,
                });
            }
        } catch (error) {
            // Игнорируем ошибки при выходе
        } finally {
            tokens.value = null;
            user.value = null;
            if (process.client) {
                navigateTo('/');
            }
        }
    };

    const initAuth = async () => {
        if (tokens.value?.access) {
            await fetchProfile();
        }
    };

    return {
        user,
        tokens,
        isAuthenticated,
        login,
        register,
        logout,
        refreshToken,
        fetchProfile,
        initAuth,
    };
};
