<!-- app/pages/profile/change-password.vue -->
<template>
    <UContainer class="py-12 max-w-2xl">
        <UCard class="p-6 mb-8 bg-gradient-to-r from-accent-950 to-surface-900 shadow-xl border-0">
            <div class="flex items-center gap-4">
                <UButton
                    to="/profile"
                    icon="i-heroicons-arrow-left"
                    variant="ghost"
                    color="neutral"
                    class="text-text-100 hover:text-text-400 hidden sm:inline-flex"
                />
                <h1 class="text-3xl font-bold text-text-100 flex-1">
                    Смена пароля
                </h1>
            </div>
        </UCard>

        <UCard class="shadow-2xl border-accent-800">
            <form @submit.prevent="handleChangePassword" class="p-8 space-y-6">
                <div>
                    <label class="block text-sm font-medium text-text-100 mb-2">Старый пароль</label>
                    <UInput v-model="form.old_password" type="password" variant="soft" color="neutral" required />
                </div>
                <div>
                    <label class="block text-sm font-medium text-text-100 mb-2">Новый пароль</label>
                    <UInput v-model="form.new_password" type="password" variant="soft" color="neutral" required />
                </div>
                <div>
                    <label class="block text-sm font-medium text-text-100 mb-2">Подтверждение</label>
                    <UInput v-model="form.new_password2" type="password" variant="soft" color="neutral" required />
                </div>

                <UAlert
                    v-if="error"
                    color="error"
                    variant="soft"
                    :title="error"
                />

                <UAlert
                    v-if="success"
                    color="success"
                    variant="soft"
                    title="Пароль успешно изменён!"
                />

                <div class="flex flex-col sm:flex-row gap-4 pt-8 border-t border-accent-800 bg-surface-900/50 p-6 rounded-xl">
                    <UButton
                        to="/profile"
                        variant="ghost"
                        color="neutral"
                        block
                        class="text-text-100 hover:text-text-400"
                    >
                        Отмена
                    </UButton>
                    <UButton
                        type="submit"
                        color="primary"
                        size="lg"
                        block
                        :loading="loading"
                    >
                        Сохранить
                    </UButton>
                </div>
            </form>
        </UCard>
    </UContainer>
</template>

<script setup lang="ts">
const api = useApi();
const form = reactive({
    old_password: '',
    new_password: '',
    new_password2: '',
});

const loading = ref(false);
const error = ref('');
const success = ref(false);

const handleChangePassword = async () => {
    if (form.new_password !== form.new_password2) {
        error.value = 'Новые пароли не совпадают';
        return;
    }

    loading.value = true;
    error.value = '';
    success.value = false;

    try {
        await api.post('/auth/change-password/', {
            old_password: form.old_password,
            new_password: form.new_password,
        });
        success.value = true;
        // Опционально: сбросить форму
        form.old_password = form.new_password = form.new_password2 = '';
    } catch (err: any) {
        error.value =
            err.response?.data?.old_password?.[0] ||
            err.response?.data?.error ||
            'Ошибка при смене пароля';
    } finally {
        loading.value = false;
    }
};
</script>

