// app/composables/useAuth.ts
import { storeToRefs } from 'pinia';
export const useAuth = () => {
    const store = useAuthStore();

    // ✅ Полная реактивность
    const { user, tokens, isAuthenticated, isInitialized, initError } =
        storeToRefs(store);

    return {
        user,
        tokens,
        isAuthenticated,
        isInitialized,
        initError,
        login: store.login,
        logout: store.logout,
        refreshToken: store.refreshToken,
        fetchProfile: store.fetchProfile,
        initialize: store.initialize,
    };
};
