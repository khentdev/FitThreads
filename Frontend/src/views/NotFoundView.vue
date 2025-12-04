<template>
    <section class="flex min-h-screen flex-col items-center justify-center bg-surface-app p-4 text-center">
        <div class="flex flex-col items-center gap-6">
            <h1 class="text-9xl font-extrabold text-text-default opacity-10">404</h1>
            <div class="flex flex-col gap-2">
                <h2 class="text-2xl font-bold text-text-default">Page not found</h2>
                <p class="text-text-muted">
                    The page you are looking for doesn't exist or has been moved.
                </p>
            </div>
            <RouterLink to="/"
                class="mt-4 flex h-12 items-center justify-center rounded-lg bg-solid-primary px-8 font-bold text-bg-primary transition-colors hover:bg-solid-hover focus:outline-none focus:ring-2 focus:ring-border-focus focus:ring-offset-2">
                Go back home
            </RouterLink>
        </div>
    </section>
</template>

<script setup lang="ts">
    import { RouterLink } from 'vue-router'
</script>
