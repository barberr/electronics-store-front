<!-- pages/debug-icons.vue -->
<template>
    <div class="p-6 bg-bg-950/50">
        <h1 class="text-2xl font-bold mb-6">Доступные иконки</h1>

        <div class="grid grid-cols-4 gap-4">
            <div
                v-for="icon in heroiconsList"
                :key="icon"
                class="border p-4 rounded-lg text-center"
            >
                <UIcon :name="`i-heroicons-${icon}`" class="w-6 h-6 mx-auto" />
                <div class="mt-2 text-sm text-gray-600">{{ icon }}</div>
            </div>
        </div>
    </div>
</template>

<script setup>
// Список популярных heroicons
const heroiconsList = [
    'arrow-down',
    'photo',
    'shopping-bag',
    'home',
    'user',
    'cog',
    'bell',
    'magnifying-glass',
    // ... добавьте нужные иконки
];
</script>
