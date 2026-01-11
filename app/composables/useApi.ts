// composables/useApi.ts
import axios from 'axios';

// Расширяем типы axios, чтобы TS не ругался
declare module 'axios' {
    export interface AxiosRequestConfig {
        skipAuth?: boolean;
    }
}

const api = axios.create({
    // baseURL: 'http://10.10.4.12:8000/api/', // ← твой DRF API
    baseURL: 'http://127.0.0.1:8000/api/',
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
        // 'Authorization': 'Token xxx' — если нужна аутентификация
    },
});

// 👇 Добавляем перехватчик запросов
api.interceptors.request.use((config) => {
    // 👇 Проверяем флаг skipAuth
    if (process.client && !config.skipAuth) {
        const tokensStr = localStorage.getItem('auth_tokens');
        if (tokensStr) {
            try {
                const tokens = JSON.parse(tokensStr);
                if (tokens.access) {
                    config.headers.Authorization = `Bearer ${tokens.access}`;
                }
            } catch (e) {
                console.warn('Failed to parse tokens');
            }
        }
    }
    return config;
});

export default () => api;
