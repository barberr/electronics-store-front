<!-- app/pages/profile/index.vue -->
<script setup lang="ts">
definePageMeta({
    ssr: false, // ← отключает SSR для этой страницы
});

const { user, tokens, logout, isAuthenticated, initAuth } = useAuth();
const router = useRouter();

onMounted(async () => {
    await initAuth(); // ← подтягивает профиль, если есть токены

    if (!isAuthenticated.value) {
        router.push('/login');
    }
});

const handleLogout = async () => {
    await logout();
    navigateTo('/login');
};

// Фильтр для даты (опционально)
const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('ru-RU');
};
</script>

<template>
    <UContainer class="py-8">
        <div v-if="isAuthenticated" class="profile-page">
            <!-- Header -->
            <div class="flex items-center justify-between mb-8">
                <div class="flex items-center">
                    <UAvatar
                        :src="user?.avatar || '/default-avatar.png'"
                        :name="user?.username || ''"
                        size="2xl"
                        class="mr-6"
                    />
                    <div>
                        <h1 class="text-3xl font-bold text-gray-900 mb-1">
                            {{ user?.first_name || '' }}
                            {{ user?.last_name || '' }}
                        </h1>
                        <p class="text-xl text-gray-500">
                            {{ user?.username }}
                        </p>
                    </div>
                </div>
                <UBadge size="xl" color="green" variant="soft">Активен</UBadge>
            </div>

            <!-- Stats -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <UCard class="text-center p-6">
                    <div class="text-3xl font-bold text-primary mb-2">
                        {{ user?.id }}
                    </div>
                    <div class="text-sm text-gray-500 uppercase tracking-wide">
                        ID
                    </div>
                </UCard>
                <UCard class="text-center p-6">
                    <div class="text-3xl font-bold text-blue-600 mb-2">
                        {{ user?.email }}
                    </div>
                    <div class="text-sm text-gray-500 uppercase tracking-wide">
                        Email
                    </div>
                </UCard>
                <UCard class="text-center p-6">
                    <div class="text-3xl font-bold text-green-600 mb-2">
                        {{ user?.date_joined | formatDate }}
                    </div>
                    <div class="text-sm text-gray-500 uppercase tracking-wide">
                        Дата регистрации
                    </div>
                </UCard>
            </div>

            <!-- Actions -->
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8">
                <UCard>
                    <div class="flex items-center justify-between p-4">
                        <div>
                            <h3 class="text-lg font-semibold mb-1">Действия</h3>
                            <p class="text-sm text-gray-500">
                                Управление профилем
                            </p>
                        </div>
                        <UButton
                            to="/profile/change-password"
                            color="blue"
                            variant="ghost"
                        >
                            <UIcon
                                name="i-heroicons-pencil"
                                class="mr-2 w-4 h-4"
                            />
                            Сменить пароль
                        </UButton>
                    </div>
                </UCard>
                <UCard>
                    <div class="flex items-center justify-between p-4">
                        <div>
                            <h3 class="text-lg font-semibold mb-1">
                                Безопасность
                            </h3>
                            <p class="text-sm text-gray-500">
                                Управление сессиями
                            </p>
                        </div>
                        <UButton color="gray" variant="ghost">
                            <UIcon
                                name="i-heroicons-shield-check"
                                class="mr-2 w-4 h-4"
                            />
                            Сессии
                        </UButton>
                    </div>
                </UCard>
            </div>

            <!-- Logout -->
            <div class="text-center">
                <UButton
                    @click="handleLogout"
                    color="red"
                    variant="outline"
                    size="lg"
                    class="px-8"
                >
                    <UIcon
                        name="i-heroicons-arrow-right-end-on-rectangle"
                        class="mr-2 w-5 h-5"
                    />
                    Выйти из аккаунта
                </UButton>
            </div>
        </div>

        <div v-else-if="!isAuthenticated" class="text-center py-20">
            <UIcon
                name="i-heroicons-user-circle"
                class="w-24 h-24 text-gray-300 mx-auto mb-4"
            />
            <h2 class="text-2xl font-bold text-gray-900 mb-2">Авторизуйтесь</h2>
            <p class="text-gray-500 mb-6">
                Для доступа к профилю необходимо войти в аккаунт
            </p>
            <UButton to="/login" color="blue" size="lg">Войти</UButton>
        </div>

        <div v-else class="flex items-center justify-center min-h-[400px]">
            <UDivider />
            <UIcon
                name="i-heroicons-arrow-path"
                class="w-8 h-8 animate-spin mx-4 text-gray-400"
            />
            <UDivider />
            <span class="ml-2 text-gray-500">Загрузка...</span>
        </div>
    </UContainer>
</template>
<style scoped>
.profile-page :deep(.u-card) {
    transition: all 0.2s ease;
}

.profile-page :deep(.u-card:hover) {
    transform: translateY(-2px);
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
}
</style>
