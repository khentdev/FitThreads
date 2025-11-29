<template>
    <div class="not-found">
        <h1>404</h1>
        <p>Page not found</p>
        <RouterLink to="/">Go back home</RouterLink>
    </div>
</template>

<script setup lang="ts">
    import { RouterLink } from 'vue-router'
</script>

<style scoped>
.not-found {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
}

.not-found h1 {
    font-size: 4rem;
    font-weight: bold;
    margin-bottom: 1rem;
}

.not-found p {
    font-size: 1.25rem;
    margin-bottom: 2rem;
    color: #6b7280;
}

.not-found a {
    color: #3b82f6;
    text-decoration: none;
}

.not-found a:hover {
    text-decoration: underline;
}
</style>
