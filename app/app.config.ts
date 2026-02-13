export default defineAppConfig({
    ui: {
        // Семантические цвета Nuxt UI
        colors: {
            primary: 'accent', // свой кастомный токен ниже
            neutral: 'zinc',
        },
        // Кастомные контейнеры
        // container: {
        //     base: 'w-full max-w-(--ui-container) mx-auto ',
        // },
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
    },
});
