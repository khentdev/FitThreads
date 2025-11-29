<template>
    <div class="feed-layout">
        <aside class="feed-header">
            <nav>
                <!-- Navigation will go here -->
            </nav>
        </aside>
        <main>
            <RouterView v-slot="{ Component, route }">
                <component :is="Component" :key="route.name"> </component>
            </RouterView>
        </main>
    </div>
</template>

<script setup lang="ts">
    import { RouterView } from 'vue-router'
</script>