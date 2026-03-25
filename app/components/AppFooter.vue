<template>
    <footer class="footer">
        <div class="footer-shell">
            <div class="footer-head">
                <div>
                    <p class="footer-kicker">izistor</p>
                    <h2 class="footer-title">
                        Техника, покупка и поддержка в одном месте.
                    </h2>
                </div>
                <p class="footer-note">
                    Часть разделов пока оформлена как рабочие плейсхолдеры. Тексты и
                    файлы заменим по мере готовности материалов.
                </p>
            </div>

            <div class="footer-grid">
                <section class="footer-card">
                    <h3>Гарантия</h3>
                    <ul class="footer-list">
                        <li>Гарантия: внутри будет отдельный файл.</li>
                        <li>Подключим ссылку сразу после получения финального документа.</li>
                    </ul>
                </section>

                <section class="footer-card">
                    <h3>О нас</h3>
                    <ul class="footer-list">
                        <li>Блок с описанием компании добавим отдельно.</li>
                        <li>Текст для этого раздела ещё придёт позже.</li>
                    </ul>
                </section>

                <section class="footer-card">
                    <h3>Покупка и доставка</h3>
                    <ul class="footer-list">
                        <li>Файл согласия подключим отдельным пунктом.</li>
                        <li>Здесь появится структура покупки по шагам.</li>
                        <li>Здесь же оформим информацию о доставке.</li>
                    </ul>
                </section>

                <section class="footer-card">
                    <h3>Контакты</h3>
                    <ul class="footer-list">
                        <li>
                            <a class="footer-link" href="tel:+79117770645">
                                8 911 777 06 45
                            </a>
                        </li>
                        <li>Финальный состав контактного блока уточним отдельно.</li>
                    </ul>
                </section>
            </div>

            <div class="footer-bottom">
                <div class="footer-socials">
                    <span class="footer-social-label">Мессенджеры</span>
                    <div class="footer-social-list">
                        <span
                            v-for="messenger in messengers"
                            :key="messenger"
                            class="footer-social-chip"
                        >
                            {{ messenger }}
                        </span>
                    </div>
                </div>

                <p class="footer-copy">
                    © {{ currentYear }} izistor. Материалы footer обновляются по ТЗ.
                </p>
            </div>
        </div>
    </footer>
</template>

<script setup lang="ts">
const currentYear = new Date().getFullYear();
const messengers = ['TG', 'WA', 'MAX'];
</script>

<style scoped>
.footer {
    margin-top: auto;
    border-top: 1px solid color-mix(in srgb, var(--color-surface-700) 70%, transparent);
    background:
        radial-gradient(circle at top left, rgb(21 23 28 / 0.32), transparent 35%),
        linear-gradient(180deg, var(--color-bg-950) 0%, color-mix(in srgb, var(--color-bg-950) 70%, var(--color-surface-900)) 100%);
}

.footer-shell {
    max-width: 1280px;
    margin: 0 auto;
    padding: 3.5rem 1rem 2rem;
}

.footer-head {
    display: grid;
    grid-template-columns: minmax(0, 1.3fr) minmax(280px, 0.7fr);
    gap: 1.5rem;
    align-items: end;
    margin-bottom: 2rem;
}

.footer-kicker {
    margin: 0 0 0.75rem;
    font-size: 0.8rem;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: var(--color-accent-400);
}

.footer-title {
    margin: 0;
    max-width: 12ch;
    font-size: clamp(1.8rem, 4vw, 3rem);
    line-height: 0.95;
    color: var(--color-text-100);
}

.footer-note {
    margin: 0;
    max-width: 34ch;
    justify-self: end;
    color: var(--color-text-400);
    line-height: 1.6;
}

.footer-grid {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 1rem;
}

.footer-card {
    min-height: 100%;
    padding: 1.25rem;
    border: 1px solid rgb(255 255 255 / 0.08);
    border-radius: 1.25rem;
    background: linear-gradient(180deg, rgb(255 255 255 / 0.04), rgb(255 255 255 / 0.02));
    backdrop-filter: blur(10px);
}

.footer-card h3 {
    margin: 0 0 0.9rem;
    font-size: 1rem;
    color: var(--color-text-100);
}

.footer-list {
    display: grid;
    gap: 0.7rem;
    margin: 0;
    padding: 0;
    list-style: none;
    color: var(--color-text-400);
    line-height: 1.55;
}

.footer-link {
    color: var(--color-text-100);
    text-decoration: none;
}

.footer-link:hover {
    color: var(--color-accent-300);
}

.footer-bottom {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    margin-top: 1.5rem;
    padding-top: 1.25rem;
    border-top: 1px solid rgb(255 255 255 / 0.08);
}

.footer-socials {
    display: flex;
    align-items: center;
    gap: 1rem;
    flex-wrap: wrap;
}

.footer-social-label {
    font-size: 0.8rem;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--color-text-500);
}

.footer-social-list {
    display: flex;
    gap: 0.65rem;
    flex-wrap: wrap;
}

.footer-social-chip {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 3rem;
    padding: 0.55rem 0.85rem;
    border-radius: 999px;
    border: 1px solid rgb(255 255 255 / 0.1);
    background: rgb(255 255 255 / 0.04);
    color: var(--color-text-100);
    font-size: 0.82rem;
    font-weight: 600;
    letter-spacing: 0.04em;
}

.footer-copy {
    margin: 0;
    color: var(--color-text-500);
    text-align: right;
}

@media (max-width: 1024px) {
    .footer-grid {
        grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    .footer-head {
        grid-template-columns: 1fr;
    }

    .footer-note {
        justify-self: start;
    }
}

@media (max-width: 640px) {
    .footer-shell {
        padding: 2.75rem 1rem 1.5rem;
    }

    .footer-grid {
        grid-template-columns: 1fr;
    }

    .footer-bottom {
        flex-direction: column;
        align-items: flex-start;
    }

    .footer-copy {
        text-align: left;
    }
}
</style>
