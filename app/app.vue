<script setup lang="ts">
const { initAuth } = useAuth();

onMounted(() => {
    initAuth(); // ← загружает профиль, если токен есть
});
</script>

<template>
    <UApp>
        <div class="app">
            <AppHeader />

            <main class="main-content">
                <NuxtPage />
            </main>

            <AppFooter />
        </div>
    </UApp>
</template>
