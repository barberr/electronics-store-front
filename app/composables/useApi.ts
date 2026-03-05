// composables/useApi.ts
import axios from 'axios';
import { useRequestHeaders } from 'nuxt/app';

// Расширяем типы axios, чтобы TS не ругался
declare module 'axios' {
    export interface AxiosRequestConfig {
        skipAuth?: boolean;
    }
}
const baseURL = process.env.NODE_ENV === 'production' // В хависимости от профиля сам подставится нужный endpoint
  ? 'https://izistore.info/api/'
  : 'http://127.0.0.1:8000/api/'
const api = axios.create({
    // baseURL: 'http://127.0.0.1:8000/api/',
    // baseURL: 'http://10.10.4.12:8000/api/', // ← твой DRF API
    // baseURL: 'https://94.241.171.81/api/',
    // baseURL: 'https://izistore.info/api/',
    baseURL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
        // 'Authorization': 'Token xxx' — если нужна аутентификация
    },
    withCredentials: true,
});

// Перехватчик запросов — добавляем токен
api.interceptors.request.use((config) => {
  // SSR: передаём куки из входящего запроса
  if (process.server) {
    const headers = useRequestHeaders(['cookie']);
    if (headers.cookie) {
      config.headers.cookie = headers.cookie;
    }
  }

  // Клиент: добавляем JWT из localStorage
  if (process.client && !config.skipAuth) {
    const tokensStr = localStorage.getItem('auth_tokens');
    if (tokensStr) {
      try {
        const tokens = JSON.parse(tokensStr);
        if (tokens.access) {
          config.headers.Authorization = `Bearer ${tokens.access}`;
        }
      } catch (e) {
        console.warn('Failed to parse auth tokens from localStorage');
      }
    }
  }

  return config;
});

// Перехватчик ответов — авто-рефреш при 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Повторная попытка при 401 (не более 1 раза)
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Пытаемся обновить токен
        const tokensStr = localStorage.getItem('auth_tokens');
        if (tokensStr) {
          const tokens = JSON.parse(tokensStr);
          if (tokens.refresh) {
            const refreshResponse = await axios.post(`${baseURL}auth/token/refresh/`, {
              refresh: tokens.refresh,
            });

            const newTokens = {
              access: refreshResponse.data.access,
              refresh: tokens.refresh,
            };

            localStorage.setItem('auth_tokens', JSON.stringify(newTokens));

            // Повторяем запрос с новым токеном
            originalRequest.headers.Authorization = `Bearer ${newTokens.access}`;
            return api(originalRequest);
          }
        }
      } catch (refreshError) {
        // Очищаем токены при ошибке рефреша
        localStorage.removeItem('auth_tokens');
        if (process.client) {
          window.location.href = '/login';
        }
      }
    }

    return Promise.reject(error);
  }
);

// ✅ Экспортируем как композабл (возвращает инстанс axios)
export default function useApi() {
  return api;
}