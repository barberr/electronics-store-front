<template>
    <footer
        class="footer border-b dark:border-surface-900 bg-bg-950 dark:bg-surface-900"
    >
        <div class="container">
            <div class="footer-content">
                <div class="footer-section">
                    <h3>izistor</h3>
                    <p>© {{ currentYear }} All rights reserved.</p>
                </div>

                <div class="footer-section">
                    <h4>Links</h4>
                    <ul class="footer-links">
                        <li><NuxtLink to="/">Privacy Policy</NuxtLink></li>
                        <li><NuxtLink to="/">Terms of Service</NuxtLink></li>
                        <li><NuxtLink to="/">Contact Us</NuxtLink></li>
                    </ul>
                </div>
            </div>
        </div>
    </footer>
</template>

<script setup lang="ts">
const currentYear = new Date().getFullYear();
</script>

<style scoped>
.footer {
    /* background: #2d3748;
    color: #cbd5e0; */
    padding: 2rem 0;
    margin-top: auto;
}

.container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 1rem;
}

.footer-content {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 2rem;
}

.footer-section h3 {
    color: white;
    margin-bottom: 1rem;
    font-size: 1.25rem;
}

.footer-section h4 {
    color: white;
    margin-bottom: 1rem;
    font-size: 1rem;
}

.footer-links {
    list-style: none;
}

.footer-links li {
    margin-bottom: 0.5rem;
}

.footer-links a {
    color: #cbd5e0;
    text-decoration: none;
    transition: color 0.3s ease;
}

.footer-links a:hover {
    color: white;
}
</style>
