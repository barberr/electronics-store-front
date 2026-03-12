<!-- app/pages/profile/edit.vue -->
<script setup lang="ts">
import { useAuthStore } from '~/stores/auth';
import { storeToRefs } from 'pinia';
import { reactive, ref } from 'vue';

definePageMeta({
    middleware: 'auth', // ✅ Авторизация
});

const authStore = useAuthStore();
const api = useApi();

const { user } = storeToRefs(authStore);

// Форма
const form = reactive({
    first_name: '',
    last_name: '',
    email: '',
    username: '',
    phone: '', // Добавил телефон из твоей модели
    full_name: '',
    dob: '',
});

// Состояние
const saving = ref(false);
const errors = ref<Record<string, string[]>>({});

const handleSave = async () => {
    saving.value = true;
    errors.value = {};

    try {
        const { data } = await api.patch('/auth/profile/', {
            first_name: form.first_name,
            last_name: form.last_name,
            email: form.email,
            phone: form.phone,
            full_name: form.full_name,
        });

        // Обновляем стор
        Object.assign(authStore.user, data);

        await navigateTo('/profile');
    } catch (error: any) {
        if (error.response?.data) {
            errors.value = error.response.data;
        }
    } finally {
        saving.value = false;
    }
};

// Инициализация (server-side safe)
const { data: initialUser } = await useFetch('/auth/profile/', {
    key: 'user-profile',
    server: false, // Только клиент
});

watch(
    () => user.value,
    (newUser) => {
        if (newUser) {
            form.first_name = newUser.first_name || '';
            form.last_name = newUser.last_name || '';
            form.email = newUser.email || '';
            form.username = newUser.username || '';
            form.phone = newUser.phone || '';
            form.full_name = newUser.full_name || '';
            form.dob = newUser.dob || '';
        }
    },
    { immediate: true },
);
</script>

<!-- app/pages/profile/edit.vue (исправленная версия) -->
<template>
    <UContainer class="py-12 max-w-2xl">
        <!-- Заголовок с тёмным фоном -->
        <UCard
            class="p-6 mb-8 bg-gradient-to-r from-accent-950 to-surface-900 shadow-xl border-0"
        >
            <div class="flex items-center gap-4">
                <UButton
                    to="/profile"
                    icon="i-heroicons-arrow-left"
                    variant="ghost"
                    color="neutral"
                    class="text-text-100 hover:text-accent-200 hidden sm:inline-flex"
                />
                <h1 class="text-3xl font-bold text-text-100 flex-1">
                    Редактирование профиля
                </h1>
            </div>
        </UCard>

        <!-- Форма редактирования -->
        <UCard class="shadow-2xl border-accent-800">
            <form @submit.prevent="handleSave" class="p-8 space-y-8">
                <!-- Username (readonly) -->
                <UFormGroup label="Имя пользователя" help="Нельзя изменить">
                    <UInput
                        v-model="form.username"
                        icon="i-heroicons-user-circle"
                        disabled
                        color="neutral"
                        variant="soft"
                        class="bg-accent-950 text-text-100"
                    />
                </UFormGroup>

                <!-- Email -->
                <UFormGroup
                    label="Электронная почта"
                    name="email"
                    :error="errors.email?.[0]"
                    required
                >
                    <UInput
                        v-model="form.email"
                        type="email"
                        icon="i-heroicons-envelope"
                        variant="soft"
                        color="neutral"
                        placeholder="example@mail.com"
                    />
                </UFormGroup>

                <!-- Полное имя -->
                <UFormGroup
                    label="Полное имя"
                    name="full_name"
                    :error="errors.full_name?.[0]"
                >
                    <UInput
                        v-model="form.full_name"
                        icon="i-heroicons-user-group"
                        variant="soft"
                        color="neutral"
                        placeholder="Иван Иванович"
                    />
                </UFormGroup>

                <!-- Имя + Фамилия (grid с улучшенным дизайном) -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <UFormGroup
                            label="Имя"
                            name="first_name"
                            :error="errors.first_name?.[0]"
                        >
                            <UInput
                                v-model="form.first_name"
                                icon="i-heroicons-user"
                                variant="soft"
                                color="neutral"
                                placeholder="Иван"
                            />
                        </UFormGroup>
                    </div>

                    <div>
                        <UFormGroup
                            label="Фамилия"
                            name="last_name"
                            :error="errors.last_name?.[0]"
                        >
                            <UInput
                                v-model="form.last_name"
                                icon="i-heroicons-user"
                                variant="soft"
                                color="neutral"
                                placeholder="Иванов"
                            />
                        </UFormGroup>
                    </div>
                </div>

                <!-- Телефон + ДР (дополнительные поля) -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <UFormGroup
                        label="Телефон"
                        name="phone"
                        :error="errors.phone?.[0]"
                    >
                        <UInput
                            v-model="form.phone"
                            icon="i-heroicons-phone"
                            variant="soft"
                            color="neutral"
                            placeholder="+7 (999) 123-45-67"
                        />
                    </UFormGroup>

                    <UFormGroup
                        label="Дата рождения"
                        name="dob"
                        :error="errors.dob?.[0]"
                    >
                        <UInput
                            v-model="form.dob"
                            type="date"
                            icon="i-heroicons-cake"
                            variant="soft"
                            color="neutral"
                        />
                    </UFormGroup>
                </div>

                <!-- Кнопки (улучшенный дизайн) -->
                <div
                    class="flex flex-col sm:flex-row gap-4 pt-8 border-t border-accent-800 bg-accent-950/50 p-6 rounded-xl"
                >
                    <UButton
                        to="/profile"
                        variant="ghost"
                        color="neutral"
                        block
                        sm:flex-none
                        :disabled="saving"
                        class="text-text-100 hover:text-accent-200"
                    >
                        <UIcon name="i-heroicons-arrow-left" class="mr-2" />
                        Отмена
                    </UButton>

                    <UButton
                        type="submit"
                        color="primary"
                        size="lg"
                        block
                        sm:flex-none
                        :loading="saving"
                        class="shadow-lg hover:shadow-xl transition-all font-semibold"
                    >
                        <UIcon name="i-heroicons-check-circle" class="mr-2" />
                        Сохранить изменения
                    </UButton>
                </div>
            </form>
        </UCard>
    </UContainer>
</template>
