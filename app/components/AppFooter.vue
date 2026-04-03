<template>
    <footer class="footer">
        <div class="footer-shell">
            <div class="footer-head">
                <div>
                    <img
                        src="/logo-blue-izi.svg"
                        alt="Izistor"
                        class="footer-logo"
                    >
                </div>
                <p class="footer-note">
                    Мы подбираем и настраиваем устройства под ваши задачи. Без лишних
                    решений. С полной поддержкой после покупки.
                </p>
            </div>

            <div class="footer-grid">
                <section class="footer-card">
                    <h3>О нас</h3>
                    <ul class="footer-list">
                        <li>Нам доверяют более 3 000 клиентов.</li>
                        <li>
                            Только оригинальная техника, проверенные поставщики и
                            команда, которая закрывает вопросы быстро и по делу — от
                            базовой настройки до сложных сценариев использования.
                        </li>
                    </ul>
                </section>

                <section class="footer-card">
                    <h3>Что вы получаете при покупке</h3>
                    <ul class="footer-list footer-list_compact">
                        <li class="footer-benefit">
                            <strong>iPhone</strong> — техническая поддержка при
                            переносе данных, техническая поддержка оптимизации
                            батареи, техническая поддержка точной настройки камеры,
                            техническая помощь в синхронизации с AirPods, 1 000
                            рублей cashback на следующую покупку.
                        </li>
                        <li class="footer-benefit">
                            <strong>MacBook</strong> — под ключ: гравировка клавиатуры
                            и евро-адаптер в подарок.
                        </li>
                        <li class="footer-benefit footer-benefit_note">
                            Гравировка наносится на вскрытое устройство и бережно
                            упаковывается обратно, активация не требуется.
                        </li>
                        <li class="footer-benefit">
                            <strong>iPad</strong> — с бонусом: кешбэк 1000 ₽ и
                            евро-адаптер в подарок.
                        </li>
                        <li class="footer-benefit">
                            Дополнительно: персональный подарок в день рождения*,
                            поддержка после покупки и консультации без ограничений в
                            течении гарантийного срока.
                        </li>
                        <li class="footer-benefit">
                            Постгарантийное обслуживание**.
                        </li>
                    </ul>
                    <div class="footer-footnotes">
                        <p class="footer-footnote">
                            * При условии физического посещения наших магазинов.
                            Наклейка защитного стекла, приобретенного у нас,
                            бесплатно.
                        </p>
                        <p class="footer-footnote">
                            ** Постгарантийное обслуживание не включает в себя
                            сложных технических ремонтов, более подробная информация
                            у менеджеров.
                        </p>
                    </div>
                </section>

                <section class="footer-card">
                    <h3>Оплата и гарантии</h3>
                    <ul class="footer-list">
                        <li>
                            Оплата: наличные, безналичный расчет, QR, кредит,
                            рассрочка 6 / 12 месяцев, онлайн-оплата и работа с юр.
                            лицами.
                        </li>
                        <li>Оригинальная техника Apple.</li>
                        <li>Гарантия 1 год.</li>
                        <li>Чек и полный комплект документов.</li>
                    </ul>
                </section>

                <section class="footer-card">
                    <h3>Контакты</h3>
                    <ul class="footer-list">
                        <li>
                            <a class="footer-link" href="tel:+79517505749">
                                +7 (951) 750-57-49
                            </a>
                        </li>
                        <li>
                            <a class="footer-link" href="tel:+79113625699">
                                +7 (911) 362-56-99
                            </a>
                        </li>
                        <li>
                            <a class="footer-link" href="tel:+79117770645">
                                +7 (911) 777-06-45
                            </a>
                        </li>
                        <li>Неофициальный поставщик техники Apple.</li>
                        <li>
                            Цены на сайте указаны с учетом скидки при оплате
                            наличными.
                        </li>
                    </ul>
                </section>
            </div>

            <div class="footer-bottom">
                <div class="footer-socials">
                    <span class="footer-social-label">Соцсети и мессенджеры</span>
                    <div class="footer-social-list">
                        <a
                            v-for="messenger in messengers"
                            :key="messenger.label"
                            class="footer-social-chip"
                            :href="messenger.href"
                            target="_blank"
                            rel="noopener noreferrer"
                            :aria-label="messenger.label"
                        >
                            <UIcon
                                v-if="messenger.icon"
                                :name="messenger.icon"
                                :class="[
                                    'footer-social-icon',
                                    messenger.iconClass,
                                ]"
                            />
                            <span v-else>{{ messenger.label }}</span>
                        </a>
                    </div>
                </div>

                <p class="footer-copy">
                    © {{ currentYear }} Изистор. Все права защищены.
                </p>
                <a
                    class="footer-copy footer-copy_link"
                    href="https://t.me/kachsss"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    Разработчик в Telegram: @kachsss
                </a>
            </div>
        </div>
    </footer>
</template>

<script setup lang="ts">
const currentYear = new Date().getFullYear();
const messengers = [
    {
        label: 'Telegram',
        href: 'https://t.me/izistore_price',
        icon: 'i-simple-icons-telegram',
        iconClass: 'footer-social-icon_telegram',
    },
    {
        label: 'VK',
        href: 'https://vk.ru/izistore_psk',
        icon: 'i-simple-icons-vk',
        iconClass: 'footer-social-icon_vk',
    },
    { label: 'MAX', href: '#' },
];
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

.footer-logo {
    display: block;
    width: auto;
    height: clamp(2.5rem, 5vw, 3.5rem);
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

.footer-list_compact {
    gap: 0.85rem;
}

.footer-benefit {
    padding-bottom: 0.85rem;
    border-bottom: 1px solid rgb(255 255 255 / 0.06);
}

.footer-benefit:last-child {
    padding-bottom: 0;
    border-bottom: 0;
}

.footer-benefit_note {
    margin-top: -0.25rem;
    font-size: 0.92rem;
    color: var(--color-text-500);
}

.footer-list strong {
    color: var(--color-text-100);
    font-weight: 600;
}

.footer-footnotes {
    display: grid;
    gap: 0.55rem;
    margin-top: 1rem;
    padding-top: 0.9rem;
    border-top: 1px solid rgb(255 255 255 / 0.08);
}

.footer-footnote {
    margin: 0;
    font-size: 0.84rem;
    line-height: 1.5;
    color: var(--color-text-500);
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

.footer-copy {
    margin: 0;
    color: var(--color-text-500);
}

.footer-copy_link {
    text-decoration: none;
    transition: color 0.2s ease;
}

.footer-copy_link:hover {
    color: var(--color-text-100);
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
    text-decoration: none;
    transition:
        color 0.2s ease,
        border-color 0.2s ease,
        background-color 0.2s ease;
}

.footer-social-chip:hover {
    color: var(--color-accent-300);
    border-color: rgb(255 255 255 / 0.2);
    background: rgb(255 255 255 / 0.07);
}

.footer-social-icon {
    width: 1rem;
    height: 1rem;
}

.footer-social-icon_telegram {
    color: #229ed9;
}

.footer-social-icon_vk {
    color: #0077ff;
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
