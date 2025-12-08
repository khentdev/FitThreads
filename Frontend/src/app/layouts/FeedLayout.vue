<template>
    <div class="flex h-screen w-full bg-surface-app overflow-hidden">
        <Header />
        <main class="flex-1 h-full w-full overflow-y-auto relative pb-16 md:pb-0">
            <RouterView v-slot="{ Component, route }">
                <component :is="Component" :key="route.name"> </component>
            </RouterView>
        </main>
    </div>
</template>

<script setup lang="ts">
    import { RouterView } from 'vue-router'
    import Header from '../../features/feed/components/Header.vue';
</script>