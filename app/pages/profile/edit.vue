<!-- app/pages/profile/edit.vue -->
<script setup lang="ts">
import { useAuthStore } from '~/stores/auth';
import { storeToRefs } from 'pinia';
import { reactive, ref, onMounted } from 'vue';
import { useToast } from '#imports';

definePageMeta({
    ssr: false,
});

const toast = useToast();
const router = useRouter();
const authStore = useAuthStore();
const api = useApi();

// Refs из стора
const { user, isAuthenticated, isInitialized } = storeToRefs(authStore);

// Состояние формы
const form = reactive({
    first_name: '',
    last_name: '',
    email: '',
    username: '', // Обычно username read-only, но добавим для отображения
});

const loading = ref(true);
const saving = ref(false);
const errors = ref<Record<string, string[]>>({});

// Инициализация данных
onMounted(async () => {
    try {
        if (process.client) {
            // 1. Убеждаемся, что авторизация прошла
            const success = await authStore.initialize();

            if (!success || !isAuthenticated.value) {
                toast.add({
                    title: 'Требуется авторизация',
                    color: 'orange',
                });
                return navigateTo('/login');
            }

            // 2. Заполняем форму данными пользователя
            if (user.value) {
                form.first_name = user.value.first_name || '';
                form.last_name = user.value.last_name || '';
                form.email = user.value.email || '';
                form.username = user.value.username || '';
            }
        }
    } catch (error) {
        console.error('Edit init error:', error);
        toast.add({ title: 'Ошибка загрузки данных', color: 'red' });
    } finally {
        loading.value = false;
    }
});

// Сохранение изменений
const handleSave = async () => {
    saving.value = true;
    errors.value = {};

    try {
        // Отправляем PATCH запрос (обновляем только измененные поля)
        const { data } = await api.patch('/auth/profile/', {
            first_name: form.first_name,
            last_name: form.last_name,
            email: form.email,
        });

        // Обновляем данные в сторе
        authStore.user = data;

        toast.add({
            title: 'Профиль обновлен',
            description: 'Ваши данные успешно сохранены',
            color: 'green',
        });

        // Возвращаемся в профиль
        router.push('/profile');
    } catch (error: any) {
        console.error('Update error:', error);

        // Обработка ошибок валидации от Django (обычно это объект ключей)
        if (error.response?.data) {
            errors.value = error.response.data;

            const errorMsg = Object.values(error.response.data)
                .flat()
                .join(', ');

            toast.add({
                title: 'Ошибка сохранения',
                description: errorMsg || 'Проверьте введенные данные',
                color: 'red',
            });
        } else {
            toast.add({ title: 'Произошла ошибка сервера', color: 'red' });
        }
    } finally {
        saving.value = false;
    }
};
</script>

<template>
    <UContainer class="py-8 max-w-2xl">
        <!-- Лоадер инициализации -->
        <div
            v-if="loading"
            class="flex items-center justify-center min-h-[300px]"
        >
            <UIcon
                name="i-heroicons-arrow-path"
                class="w-10 h-10 animate-spin text-primary"
            />
        </div>

        <div v-else>
            <!-- Заголовок -->
            <div class="flex items-center justify-between mb-6">
                <div class="flex items-center gap-4">
                    <UButton
                        to="/profile"
                        icon="i-heroicons-arrow-left"
                        variant="ghost"
                        color="gray"
                        class="hidden sm:inline-flex"
                    />
                    <h1 class="text-2xl font-bold text-gray-900">
                        Редактирование профиля
                    </h1>
                </div>
            </div>

            <UCard class="p-4 sm:p-6 shadow-md">
                <form @submit.prevent="handleSave" class="space-y-6">
                    <!-- Username (Read Only) -->
                    <UFormGroup
                        label="Имя пользователя (Логин)"
                        help="Нельзя изменить"
                    >
                        <UInput
                            v-model="form.username"
                            icon="i-heroicons-user"
                            disabled
                            color="gray"
                            variant="outline"
                            class="opacity-75"
                        />
                    </UFormGroup>

                    <!-- Email -->
                    <UFormGroup
                        label="Email адрес"
                        name="email"
                        :error="errors.email?.[0]"
                        required
                    >
                        <UInput
                            v-model="form.email"
                            type="email"
                            icon="i-heroicons-envelope"
                            placeholder="example@mail.com"
                        />
                    </UFormGroup>

                    <div class="grid grid-cols-1 md:grid-cols-2">
                        <!-- Имя -->
                        <UFormGroup
                            label="Имя"
                            name="first_name"
                            :error="errors.first_name?.[0]"
                        >
                            <UInput
                                v-model="form.first_name"
                                icon="i-heroicons-identification"
                                placeholder="Иван"
                            />
                        </UFormGroup>

                        <!-- Фамилия -->
                        <UFormGroup
                            label="Фамилия"
                            name="last_name"
                            :error="errors.last_name?.[0]"
                        >
                            <UInput
                                v-model="form.last_name"
                                icon="i-heroicons-identification"
                                placeholder="Иванов"
                            />
                        </UFormGroup>
                    </div>

                    <!-- Кнопки действий -->
                    <div
                        class="flex items-center justify-end gap-4 pt-4 border-t border-gray-100 mt-6"
                    >
                        <UButton
                            to="/profile"
                            variant="ghost"
                            color="gray"
                            :disabled="saving"
                        >
                            Отмена
                        </UButton>

                        <UButton
                            type="submit"
                            color="primary"
                            size="lg"
                            :loading="saving"
                            icon="i-heroicons-check"
                        >
                            Сохранить изменения
                        </UButton>
                    </div>
                </form>
            </UCard>
        </div>
    </UContainer>
</template>
