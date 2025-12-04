<template>
    <SessionRefreshOverlay v-if="authStore.states.isRefreshingSession" />
    <SessionRefreshErrorOverlay v-else-if="authStore.systemErrors.sessionError" />
    <slot v-else></slot>
</template>
<script setup lang="ts">
    import SessionRefreshErrorOverlay from '../SessionRefreshErrorOverlay.vue';
    import SessionRefreshOverlay from '../SessionRefreshOverlay.vue';
    import { useAuthStore } from '../../../features/auth/store/authStore';
    const authStore = useAuthStore()
</script>