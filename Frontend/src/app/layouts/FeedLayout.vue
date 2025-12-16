<template>
    <div class="flex h-screen w-full bg-surface-app">
        <Header />
        <main class="flex-1 h-full w-full overflow-y-scroll relative pb-16 md:pb-0">
            <RouterView v-slot="{ Component}">
                <component :is="Component"> </component>
            </RouterView>
        </main>
    </div>
</template>

<script setup lang="ts">
    import { RouterView } from 'vue-router'
    import Header from '../../features/feed/components/Header.vue';
</script>