<!-- app.vue -->
<script setup lang="ts">
// Глобальная инициализация авторизации только на клиенте
const { initAuth } = useAuth();

onMounted(() => {});

// Глобальные обработчики событий (опционально)
// Можно добавить обработчики для показа уведомлений о логине/логауте
</script>

<template>
    <UApp>
        <div class="app min-h-screen flex flex-col">
            <!-- Header -->
            <AppHeader />

            <!-- Основной контент -->
            <main class="main-content flex-1">
                <!-- Flash сообщения (если используете) -->
                <UContainer v-if="$route.meta.layout === 'default'">
                    <div class="pt-4 pb-8">
                        <UNotifications />
                    </div>
                </UContainer>

                <!-- Страницы -->
                <NuxtPage />
            </main>

            <!-- Footer -->
            <AppFooter />
        </div>
    </UApp>
</template>
