<!-- app/pages/profile/index.vue -->
<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useToast } from '#imports';
const toast = useToast();
definePageMeta({
    //     middleware: 'auth', // ← используйте middleware вместо проверки в onMounted
    ssr: false, // ← убираем, используем middleware для SSR
});

const {
    user,
    isAuthenticated,
    logout: authLogout,
    fetchProfile,
    initAuth,
} = useAuth();

const router = useRouter();

const loading = ref(true);
const profileError = ref('');

onMounted(async () => {
    try {
        if (process.client) {
            // 1. Ждём initAuth, который уже сам дергает fetchProfile
            await initAuth();

            console.log(user.value);
            return navigateTo('/profile');
            // 2. Проверяем авторизацию ПОСЛЕ initAuth
            if (!user.value) {
                toast.add({
                    title: 'Требуется авторизация',
                    color: 'orange',
                });
                return navigateTo('/login');
            }

            // 3. Дополнительно догружать профиль можно уже не обязательно,
            // но если хочешь – это просто обновление
            const loaded = await fetchProfile();
            if (!loaded) {
                profileError.value = 'Ошибка загрузки профиля';
            }
        }
    } catch (error) {
        console.error('Profile init error:', error);
        profileError.value = 'Ошибка инициализации';
    } finally {
        loading.value = false;
    }
});

const handleLogout = async () => {
    await authLogout();
    // navigateTo выполняется в logout()
};

// Фильтр для даты
const formatDate = (dateString: string) => {
    if (!dateString) return 'Не указана';
    try {
        return new Date(dateString).toLocaleDateString('ru-RU', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    } catch {
        return dateString;
    }
};

// Вычисляемое полное имя
const displayName = computed(() => {
    if (!user.value) return '';
    const { first_name, last_name, username } = user.value;
    if (first_name || last_name) {
        return `${first_name || ''} ${last_name || ''}`.trim() || username;
    }
    return username || 'Пользователь';
});
</script>

<template>
    <UContainer class="py-8 max-w-4xl">
        <!-- Лоадер -->
        <div
            v-if="!isAuthenticated"
            class="flex items-center justify-center min-h-[400px]"
        >
            <div class="text-center">
                <UIcon
                    name="i-heroicons-arrow-path"
                    class="w-12 h-12 animate-spin mx-auto mb-4 text-primary"
                />
                <p class="text-gray-500">Проверка авторизации...</p>
            </div>
        </div>

        <!-- Контент профиля (только если авторизован) -->
        <div v-else-if="isAuthenticated && user" class="profile-page">
            <!-- Header -->
            <div
                class="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 mb-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl"
            >
                <div class="flex items-center flex-1">
                    <UAvatar
                        :src="user.avatar || undefined"
                        :name="displayName"
                        size="xl"
                        class="mr-6 ring-4 ring-white shadow-lg"
                    />
                    <div>
                        <h1
                            class="text-3xl lg:text-4xl font-bold text-gray-900 mb-1 leading-tight"
                        >
                            {{ displayName }}
                        </h1>
                        <p class="text-lg text-gray-600 mb-1">
                            {{ user.username }}
                        </p>
                        <p class="text-sm text-gray-500">
                            {{ user.email }}
                        </p>
                    </div>
                </div>
                <UBadge
                    size="lg"
                    color="green"
                    variant="solid"
                    class="whitespace-nowrap"
                >
                    Активный аккаунт
                </UBadge>
            </div>

            <!-- Статистика -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                <UCard
                    class="text-center p-8 hover:shadow-xl transition-all duration-300"
                >
                    <div class="text-4xl font-bold text-primary mb-2">
                        {{ user.id }}
                    </div>
                    <div
                        class="text-sm text-gray-500 uppercase tracking-wide font-medium"
                    >
                        ID профиля
                    </div>
                </UCard>

                <UCard
                    class="text-center p-8 hover:shadow-xl transition-all duration-300"
                >
                    <div
                        class="text-3xl font-bold text-blue-600 mb-2 break-all"
                    >
                        {{ user.email }}
                    </div>
                    <div
                        class="text-sm text-gray-500 uppercase tracking-wide font-medium"
                    >
                        Email
                    </div>
                </UCard>

                <UCard
                    class="text-center p-8 hover:shadow-xl transition-all duration-300"
                >
                    <div class="text-3xl font-bold text-green-600 mb-2">
                        {{ formatDate(user.date_joined) }}
                    </div>
                    <div
                        class="text-sm text-gray-500 uppercase tracking-wide font-medium"
                    >
                        Зарегистрирован
                    </div>
                </UCard>
            </div>

            <!-- Быстрые действия -->
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
                <UCard class="p-8 hover:shadow-xl transition-all duration-300">
                    <div class="flex items-center justify-between">
                        <div>
                            <h3
                                class="text-xl font-semibold text-gray-900 mb-2"
                            >
                                Управление профилем
                            </h3>
                            <p class="text-gray-600">
                                Обновите личные данные и настройки
                            </p>
                        </div>
                        <UButton
                            to="/profile/edit"
                            color="blue"
                            variant="outline"
                            size="lg"
                            icon="i-heroicons-pencil-square"
                        >
                            Редактировать
                        </UButton>
                    </div>
                </UCard>

                <UCard class="p-8 hover:shadow-xl transition-all duration-300">
                    <div class="flex items-center justify-between">
                        <div>
                            <h3
                                class="text-xl font-semibold text-gray-900 mb-2"
                            >
                                Безопасность
                            </h3>
                            <p class="text-gray-600">
                                Управление паролем и сессиями
                            </p>
                        </div>
                        <UButton
                            to="/profile/change-password"
                            color="orange"
                            variant="outline"
                            size="lg"
                            icon="i-heroicons-key"
                        >
                            Пароль
                        </UButton>
                    </div>
                </UCard>
            </div>

            <!-- Выход -->
            <UCard
                class="text-center p-12 border-2 border-dashed border-gray-200"
            >
                <UButton
                    @click="handleLogout"
                    color="red"
                    variant="outline"
                    size="xl"
                    class="px-12 font-semibold"
                    icon="i-heroicons-arrow-right-end-on-rectangle"
                >
                    Выйти из аккаунта
                </UButton>
                <p class="text-sm text-gray-500 mt-3">
                    Будете перенаправлены на главную страницу
                </p>
            </UCard>
        </div>

        <!-- Ошибка загрузки -->
        <div
            v-else-if="isAuthenticated && !user"
            class="flex items-center justify-center min-h-[400px]"
        >
            <div class="text-center">
                <UIcon
                    name="i-heroicons-exclamation-triangle"
                    class="w-16 h-16 text-red-400 mx-auto mb-4"
                />
                <h2 class="text-2xl font-bold text-gray-900 mb-2">
                    Ошибка загрузки профиля
                </h2>
                <p class="text-gray-500 mb-6 max-w-md mx-auto">
                    Не удалось загрузить данные профиля. Попробуйте войти
                    заново.
                </p>
                <UButton @click="fetchProfile" color="blue" class="mr-3"
                    >Обновить</UButton
                >
                <UButton to="/login" color="gray" variant="outline"
                    >Выйти</UButton
                >
            </div>
        </div>
    </UContainer>
</template>

<style scoped>
.profile-page :deep(.u-card) {
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.profile-page :deep(.u-card:hover) {
    transform: translateY(-4px);
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.15);
}
</style>
