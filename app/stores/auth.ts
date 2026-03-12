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

    const applyAuthSession = async (session: {
        access: string;
        refresh: string;
        user?: any;
    }) => {
        tokens.value = {
            access: session.access,
            refresh: session.refresh,
        };

        localStorage.setItem('auth_tokens', JSON.stringify(tokens.value));

        if (session.user) {
            user.value = session.user;
        } else {
            const { data: profileData } = await api.get('/auth/profile/');
            user.value = profileData;
        }

        isInitialized.value = true;
    };

    // ✅ Основной computed - true только при полном успехе
    const isAuthenticated = computed(() => {
        return !!tokens.value?.access && !!user.value && isInitialized.value;
    });

    // Инициализация (только клиент)
    const initialize = async () => {
        if (!import.meta.client || isInitialized.value) return true;

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
            await applyAuthSession(data);
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

    const register = async (credentials: {
        username: string;
        email: string;
        password: string;
        password2: string;
        first_name?: string;
        last_name?: string;
    }) => {
        try {
            // Очищаем предыдущие токены перед регистрацией
            tokens.value = null;
            user.value = null;
            localStorage.removeItem('auth_tokens');
            
            // Отправляем запрос на регистрацию
            const { data } = await api.post('/auth/register/', {
                username: credentials.username.trim(),
                email: credentials.email.trim(),
                password: credentials.password,
                password2: credentials.password2,
                first_name: credentials.first_name?.trim() || '',
                last_name: credentials.last_name?.trim() || '',
            });

            return { 
                success: true,
                message: data.message,
                email: data.email,
                verification_required: data.verification_required === true
            };
        } catch (error: any) {
            console.error('Registration error:', error);
            
            // Обработка ошибок валидации DRF
            let errors: Record<string, string[]> = {};
            let errorMessage = 'Ошибка регистрации. Проверьте введенные данные.';
            
            if (error.response?.data) {
                // DRF возвращает ошибки в формате { поле: [сообщения] }
                if (typeof error.response.data === 'object') {
                    // Фильтруем системные поля (например, 'detail')
                    Object.keys(error.response.data).forEach(key => {
                        if (key !== 'detail' && Array.isArray(error.response.data[key])) {
                            errors[key] = error.response.data[key];
                        }
                    });
                    
                    // Получаем общее сообщение об ошибке
                    if (error.response.data.detail) {
                        errorMessage = error.response.data.detail;
                    } else if (error.response.data.non_field_errors) {
                        errorMessage = error.response.data.non_field_errors[0];
                    } else if (Object.keys(errors).length > 0) {
                        // Берем первую ошибку из любого поля
                        const firstErrorField = Object.keys(errors)[0];
                        const firstError = firstErrorField ? errors[firstErrorField]?.[0] : null;
                        if (firstError) {
                            errorMessage = firstError;
                        }
                    }
                }
            }
            
            return { 
                success: false, 
                error: errorMessage,
                errors: errors 
            };
        }
    };

    const verifyEmailPin = async (payload: { email: string; pin: string }) => {
        try {
            const { data } = await api.post('/auth/verify-email-pin/', {
                email: payload.email.trim(),
                pin: payload.pin.trim(),
            });

            await applyAuthSession(data);

            return {
                success: true,
                message: data.message,
            };
        } catch (error: any) {
            return {
                success: false,
                error:
                    error.response?.data?.pin?.[0] ||
                    error.response?.data?.detail ||
                    error.response?.data?.message ||
                    'Не удалось подтвердить email',
            };
        }
    };

    const resendEmailPin = async (email: string) => {
        try {
            const { data } = await api.post('/auth/resend-email-pin/', {
                email: email.trim(),
            });

            return {
                success: true,
                message: data.message,
                email: data.email,
            };
        } catch (error: any) {
            return {
                success: false,
                error:
                    error.response?.data?.email?.[0] ||
                    error.response?.data?.detail ||
                    error.response?.data?.message ||
                    'Не удалось отправить PIN повторно',
            };
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
        register,
        verifyEmailPin,
        resendEmailPin,
    };
});
