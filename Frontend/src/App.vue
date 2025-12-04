<template>
    <Toast />
    <router-view v-slot="{ Component }">
        <BaseOverlay>
            <component :is="Component" />
        </BaseOverlay>
    </router-view>
</template>
<script setup>
    import Toast from './shared/components/Toast.vue';
    import BaseOverlay from './shared/components/system/BaseOverlay.vue';
</script>