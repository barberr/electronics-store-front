export default defineAppConfig({
    ui: {
        // Семантические цвета Nuxt UI
        colors: {
            primary: 'accent', // свой кастомный токен ниже
            neutral: 'zinc',
        },
        // Кастомные контейнеры
        container: {
            base: 'w-full max-w-(--ui-container) mx-auto px-4 py-4 sm:px-6 lg:px-8',
        },
        // Типографика (через Tailwind font-sans)
        fontFamily: {
            sans: [
                'Inter',
                'SF Pro Text',
                'Manrope',
                'system-ui',
                'sans-serif',
            ],
        },
        icons: {
            // Указываем только нужные иконки
            heroicons: {
                photo: 'i-heroicons-photo',
                'shopping-bag': 'i-heroicons-shopping-bag',
                'arrow-down': 'i-heroicons-arrow-down',
                home: 'i-heroicons-home',
                user: 'i-heroicons-user',
                cog: 'i-heroicons-cog',
                bell: 'i-heroicons-bell',
                'magnifying-glass': 'i-heroicons-magnifying-glass',
            },
        },
    },
});
