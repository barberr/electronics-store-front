// middleware/auth.ts
export default defineNuxtRouteMiddleware(async (to, from) => {
    const { isAuthenticated } = useAuth();
    console.log('isAuthenticated', isAuthenticated);
    if (!isAuthenticated.value) {
        return navigateTo('/login');
    }
});
