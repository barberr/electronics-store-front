// app/middleware/guest.ts
export default defineNuxtRouteMiddleware((to, from) => {
    if (import.meta.server) {
        return;
    }
    const { isAuthenticated } = useAuth();

    if (isAuthenticated.value) {
        return navigateTo('/profile');
    }
});
