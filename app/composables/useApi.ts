import axios, { AxiosHeaders } from 'axios';
import type {
  AxiosError,
  AxiosInstance,
  InternalAxiosRequestConfig
} from 'axios';
import { navigateTo, useRequestHeaders, useRuntimeConfig } from 'nuxt/app';

declare module 'axios' {
  export interface AxiosRequestConfig {
    skipAuth?: boolean;
    _retry?: boolean;
  }
}

let apiInstance: AxiosInstance | null = null;
let refreshPromise: Promise<string | null> | null = null;

function setHeader(
  headers: InternalAxiosRequestConfig['headers'],
  key: string,
  value: string
) {
  const normalizedHeaders = headers instanceof AxiosHeaders
    ? headers
    : new AxiosHeaders(headers);

  normalizedHeaders.set(key, value);
  return normalizedHeaders;
}

function getApiBase() {
  const config = useRuntimeConfig();
  return config.public.apiBase || (
    import.meta.dev
      ? 'http://127.0.0.1:8000/api/'
      : 'https://izistor.ru/api/'
  );
}

async function refreshAccessToken(apiBase: string) {
  if (refreshPromise) {
    return refreshPromise;
  }

  refreshPromise = (async () => {
    if (!import.meta.client) {
      return null;
    }

    const tokensStr = localStorage.getItem('auth_tokens');
    if (!tokensStr) {
      return null;
    }

    let tokens: { access?: string; refresh?: string };

    try {
      tokens = JSON.parse(tokensStr);
    } catch {
      localStorage.removeItem('auth_tokens');
      return null;
    }

    if (!tokens.refresh) {
      localStorage.removeItem('auth_tokens');
      return null;
    }

    const { data } = await axios.post(
      new URL('auth/token/refresh/', apiBase).toString(),
      { refresh: tokens.refresh },
      {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    const nextTokens = {
      access: data.access,
      refresh: tokens.refresh
    };

    localStorage.setItem('auth_tokens', JSON.stringify(nextTokens));
    return nextTokens.access ?? null;
  })();

  try {
    return await refreshPromise;
  } finally {
    refreshPromise = null;
  }
}

function createApiClient(): AxiosInstance {
  const apiBase = getApiBase();

  const api = axios.create({
    baseURL: apiBase,
    timeout: 10000,
    withCredentials: true,
    headers: {
      'Content-Type': 'application/json'
    }
  });

  api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    if (import.meta.server) {
      const headers = useRequestHeaders(['cookie']);
      if (headers.cookie) {
        config.headers = setHeader(config.headers, 'cookie', headers.cookie);
      }
    }

    if (import.meta.client && !config.skipAuth) {
      const tokensStr = localStorage.getItem('auth_tokens');
      if (tokensStr) {
        try {
          const tokens = JSON.parse(tokensStr);
          if (tokens.access) {
            config.headers = setHeader(config.headers, 'Authorization', `Bearer ${tokens.access}`);
          }
        } catch {
          localStorage.removeItem('auth_tokens');
          console.warn('Invalid auth_tokens in localStorage');
        }
      }
    }

    return config;
  });

  api.interceptors.response.use(
    response => response,
    async (error: AxiosError) => {
      const originalRequest = error.config;

      if (
        !originalRequest ||
        originalRequest.skipAuth ||
        originalRequest._retry ||
        error.response?.status !== 401
      ) {
        return Promise.reject(error);
      }

      originalRequest._retry = true;

      if (!import.meta.client) {
        return Promise.reject(error);
      }

      try {
        const accessToken = await refreshAccessToken(apiBase);

        if (!accessToken) {
          throw error;
        }

        originalRequest.headers = setHeader(
          originalRequest.headers,
          'Authorization',
          `Bearer ${accessToken}`
        );

        return api(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem('auth_tokens');
        await navigateTo('/login');
        return Promise.reject(refreshError);
      }
    }
  );

  return api;
}

export default function useApi() {
  if (!apiInstance) {
    apiInstance = createApiClient();
  }

  return apiInstance;
}
