interface AuthUser {
    id: number;
    username: string;
    email: string;
}

interface AuthTokens {
    access: string;
    refresh: string;
}

export const useAuth = () => {
    const api = useApi();

    // Токены
    const tokens = useToken();
    const user = ref<AuthUser | null>(null);
    const isAuthenticated = computed(
        () => !!tokens.value?.access && !!user.value,
    );

    // Загрузка профиля
    const fetchProfile = async () => {
        try {
            const { data } = await api.get('/authentication/profile/');
            user.value = data;
        } catch (error) {
            user.value = null;
            tokens.value = null;
        }
    };

    // Логин
    const login = async (credentials: {
        username: string;
        password: string;
    }) => {
        try {
            const { data } = await api.post(
                '/authentication/login/',
                credentials,
            );
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

    // Регистрация
    const register = async (userData: {
        username: string;
        email: string;
        password: string;
    }) => {
        try {
            await api.post('/authentication/register/', userData);
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

    // Обновление токена
    const refreshToken = async () => {
        try {
            const { data } = await api.post('/authentication/token/refresh/', {
                refresh: tokens.value?.refresh,
            });
            tokens.value = {
                access: data.access,
                refresh: tokens.value?.refresh || '',
            };
            return true;
        } catch (error) {
            tokens.value = null;
            user.value = null;
            return false;
        }
    };

    // Выход
    const logout = async () => {
        try {
            await api.post('/authentication/logout/', {
                refresh: tokens.value?.refresh,
            });
        } catch (error) {
            // Игнорируем ошибки logout
        } finally {
            tokens.value = null;
            user.value = null;
            navigateTo('/');
        }
    };

    // Автоматическая проверка при загрузке
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
