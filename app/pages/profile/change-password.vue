<!-- app/pages/profile/change-password.vue -->
<template>
    <div>
        <h2>Смена пароля</h2>
        <form @submit.prevent="handleChangePassword">
            <div>
                <label>Старый пароль:</label>
                <input v-model="form.old_password" type="password" required />
            </div>
            <div>
                <label>Новый пароль:</label>
                <input v-model="form.new_password" type="password" required />
            </div>
            <div>
                <label>Подтверждение:</label>
                <input v-model="form.new_password2" type="password" required />
            </div>
            <button type="submit" :disabled="loading">Сохранить</button>
        </form>

        <p v-if="error" class="error">{{ error }}</p>
        <p v-if="success" class="success">Пароль успешно изменён!</p>
    </div>
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

<style scoped>
.error {
    color: red;
}
.success {
    color: green;
}
</style>
