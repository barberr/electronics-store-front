// plugins/api.client.ts (только для клиента!)
export default defineNuxtPlugin((nuxtApp) => {
    const api = useApi(); // твой useApi()

    // Автоматически берёт CSRF из куки csrftoken и ставит в заголовок X-CSRFToken
    api.defaults.withCredentials = true;
    api.defaults.xsrfCookieName = 'csrftoken';
    api.defaults.xsrfHeaderName = 'X-CSRFToken';

    // Получаем CSRF куки от Django при первом запросе
    api.get('/auth/csrf/'); // специальный эндпоинт Django, который ставит куки
});
