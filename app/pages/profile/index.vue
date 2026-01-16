<!-- app/pages/profile/index.vue -->
<script setup lang="ts">
import { useAuthStore } from '~/stores/auth';
import { storeToRefs } from 'pinia';
import { ref, computed, onMounted } from 'vue';

definePageMeta({
    middleware: 'auth', // ✅ Автоматическая проверка авторизации
    layout: 'default', // Твой основной layout
});

const authStore = useAuthStore();
const { user, isAuthenticated, logout } = storeToRefs(authStore);

const loading = ref(true);
const profileError = ref('');

// Вычисляемое полное имя
const displayName = computed(() => {
    if (!user.value) return 'Пользователь';

    const { first_name, last_name, username } = user.value;
    if (first_name || last_name) {
        return `${first_name || ''} ${last_name || ''}`.trim() || username;
    }
    return username || 'Пользователь';
});

// Формат даты
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

const handleLogout = async () => {
    try {
        await logout();
        // navigateTo выполняется в logout()
    } catch (error) {
        console.error('Logout error:', error);
    }
};
</script>

<template>
    <UContainer class="py-12 max-w-4xl">
        <!-- Лоадер (если middleware пропустит) -->
        <div
            v-if="!isAuthenticated"
            class="flex items-center justify-center min-h-[50vh]"
        >
            <div class="text-center">
                <ULoader size="xl" color="primary" class="mx-auto mb-4" />
                <p class="text-text-400">Проверка авторизации...</p>
            </div>
        </div>

        <!-- Контент профиля -->
        <div v-else-if="user" class="space-y-12">
            <!-- Header -->
            <UCard
                class="p-8 lg:p-12 bg-gradient-to-br from-accent-950 to-surface-900 border-0"
            >
                <div
                    class="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6"
                >
                    <div class="flex items-center flex-1">
                        <UAvatar
                            :src="user.avatar"
                            :name="displayName"
                            size="2xl"
                            class="ring-4 ring-bg-950 shadow-2xl mr-6"
                        />
                        <div>
                            <h1
                                class="text-3xl lg:text-4xl font-bold text-text-100 mb-2 leading-tight"
                            >
                                {{ displayName }}
                            </h1>
                            <p class="text-text-400 mb-1 text-lg">
                                {{ user.username }}
                            </p>
                            <p class="text-text-400 text-sm break-all">
                                {{ user.email }}
                            </p>
                        </div>
                    </div>
                    <UBadge
                        size="lg"
                        color="success"
                        variant="solid"
                        class="whitespace-nowrap text-text-100"
                    >
                        Активный аккаунт
                    </UBadge>
                </div>
            </UCard>

            <!-- Статистика -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                <UCard
                    class="text-center p-8 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300"
                >
                    <div class="text-4xl font-bold text-primary mb-3">
                        {{ user.id }}
                    </div>
                    <div
                        class="text-text-400 uppercase tracking-wide font-medium text-sm"
                    >
                        ID профиля
                    </div>
                </UCard>

                <UCard
                    class="text-center p-8 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300"
                >
                    <div class="text-xl font-bold text-text-100 mb-2 break-all">
                        {{ user.email }}
                    </div>
                    <div
                        class="text-text-400 uppercase tracking-wide font-medium text-sm mb-1"
                    >
                        Email
                    </div>
                    <div class="space-y-1">
                        <div class="text-lg font-semibold text-text-100">
                            {{ user.first_name }}
                        </div>
                        <div class="text-text-400 text-sm">
                            {{ user.last_name }}
                        </div>
                    </div>
                </UCard>

                <UCard
                    class="text-center p-8 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300"
                >
                    <div class="text-3xl font-bold text-success mb-3">
                        {{ formatDate(user.date_joined) }}
                    </div>
                    <div
                        class="text-text-400 uppercase tracking-wide font-medium text-sm"
                    >
                        Зарегистрирован
                    </div>
                </UCard>
            </div>

            <!-- Быстрые действия -->
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <UCard
                    class="p-8 group hover:shadow-2xl hover:-translate-y-2 transition-all duration-300"
                >
                    <div class="flex items-center justify-between">
                        <div>
                            <h3 class="text-2xl font-bold text-text-100 mb-3">
                                Управление профилем
                            </h3>
                            <p class="text-text-400">
                                Обновите личные данные, аватар и настройки
                            </p>
                        </div>
                        <UButton
                            to="/profile/edit"
                            color="primary"
                            variant="outline"
                            size="lg"
                            icon="i-heroicons-pencil-square"
                        >
                            Редактировать
                        </UButton>
                    </div>
                </UCard>

                <UCard
                    class="p-8 group hover:shadow-2xl hover:-translate-y-2 transition-all duration-300"
                >
                    <div class="flex items-center justify-between">
                        <div>
                            <h3 class="text-2xl font-bold text-text-100 mb-3">
                                Безопасность
                            </h3>
                            <p class="text-text-400">
                                Смена пароля и управление сессиями
                            </p>
                        </div>
                        <UButton
                            to="/profile/change-password"
                            color="warning"
                            variant="outline"
                            size="lg"
                            icon="i-heroicons-key"
                        >
                            Пароль
                        </UButton>
                    </div>
                </UCard>
            </div>

            <!-- Заказы (если есть) -->
            <UCard>
                <div class="flex items-center justify-between mb-6">
                    <h3 class="text-2xl font-bold text-text-100">Мои заказы</h3>
                    <UButton to="/profile/orders" size="lg" variant="outline">
                        Все заказы
                    </UButton>
                </div>
                <div
                    class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                >
                    <!-- Пустое состояние или последние заказы -->
                    <UCard class="text-center py-12 opacity-50">
                        <UIcon
                            name="i-heroicons-shopping-bag"
                            class="w-16 h-16 text-text-400 mx-auto mb-4"
                        />
                        <h4 class="text-xl font-semibold text-text-100 mb-2">
                            Нет заказов
                        </h4>
                        <p class="text-text-400">
                            Ваш первый заказ будет здесь
                        </p>
                    </UCard>
                </div>
            </UCard>

            <!-- Выход -->
            <UCard
                class="text-center p-12 border-2 border-accent-800 hover:border-warning"
            >
                <UButton
                    @click="handleLogout"
                    color="warning"
                    size="xl"
                    class="px-16 font-semibold text-xl"
                    icon="i-heroicons-arrow-right-end-on-rectangle"
                >
                    Выйти из аккаунта
                </UButton>
                <p class="text-text-400 mt-4">
                    Будете перенаправлены на главную страницу
                </p>
            </UCard>
        </div>

        <!-- Ошибка -->
        <div v-else class="flex items-center justify-center min-h-[50vh]">
            <div class="text-center max-w-md">
                <UIcon
                    name="i-heroicons-exclamation-circle"
                    class="w-20 h-20 text-warning mx-auto mb-6"
                />
                <h2 class="text-2xl font-bold text-text-100 mb-4">
                    Ошибка загрузки профиля
                </h2>
                <p class="text-text-400 mb-8">
                    Не удалось загрузить данные. Попробуйте войти заново.
                </p>
                <div class="space-x-3">
                    <UButton to="/login" color="primary"> Войти снова </UButton>
                    <UButton
                        color="neutral"
                        variant="outline"
                        @click="window.location.reload()"
                    >
                        Обновить
                    </UButton>
                </div>
            </div>
        </div>
    </UContainer>
</template>
