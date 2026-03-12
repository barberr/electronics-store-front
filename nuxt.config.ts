// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
    devServer: {
        host: '0.0.0.0', // слушать все IP-адреса
        port: 3000, // порт, который вы выбрали
    },

    modules: ['@pinia/nuxt', '@nuxt/eslint', '@nuxt/ui', '@nuxt/image'],

    devtools: {
        enabled: true,
    },

    ui: {
        fonts: false,
    },

    icon: {
        provider: 'iconify',
        serverBundle: {
            collections: ['heroicons', 'simple-icons', 'lucide']
        }
    },

    css: ['~/assets/css/main.css'],

    image: {
        // Разрешите внешние домены вашего API
        domains: import.meta.dev ? ['10.10.4.12:8000'] : ['94.241.171.81'],
        // domains: ['10.10.4.12:8000'],
        // domains: ['94.241.171.81'],
        // Используйте IPX для обработки изображений
        provider: 'ipx',
        // Опции для IPX
        ipx: {
            modifiers: {
                format: 'webp',
                quality: 80,
            },
        },
    },

    imports: {
        dirs: ['types/**/*.ts'],
    },

    routeRules: {
        '/': { prerender: true },
    },

    compatibilityDate: '2025-01-15',

    eslint: {
        config: {
            stylistic: {
                commaDangle: 'never',
                braceStyle: '1tbs',
            },
        },
    },
    vite: {
        build: {
        sourcemap: false
        }
    },
    // Настройки для продакшена
    nitro: {
        preset: 'node-server',

        // Прокси для иконок
        routeRules: {
            '/_nuxt_icon/**': {
                proxy: 'https://api.iconify.design/**',
            },
        },
    },
    ssr: true,
    experimental: {
        payloadExtraction: false,
    },
    runtimeConfig: {
        public: {
            apiBase: ''
        }
    }
});
