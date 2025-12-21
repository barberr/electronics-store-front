// composables/useApi.ts
import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:8000/api/v1/', // ← твой DRF API
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
        // 'Authorization': 'Token xxx' — если нужна аутентификация
    },
});

// Опционально: добавь перехватчики
// api.interceptors.response.use(...)

export default () => api;
