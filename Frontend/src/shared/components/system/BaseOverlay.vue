<template>
    <RateLimitErrorOverlay v-if="authStore.systemErrors.rateLimitError" />
    <SessionRefreshOverlay v-else-if="authStore.states.isRefreshingSession" />
    <SessionRefreshErrorOverlay v-else-if="authStore.systemErrors.sessionError" />
    <slot v-else></slot>
</template>
<script setup lang="ts">
    import { watch } from 'vue';
    import { useAuthStore } from '../../../features/auth/store/authStore';
    import { useToast } from '../../composables/toast/useToast';
    import { useNetworkStatus } from '../../composables/useNetworkStatus';
    import RateLimitErrorOverlay from '../RateLimitErrorOverlay.vue';
    import SessionRefreshErrorOverlay from '../SessionRefreshErrorOverlay.vue';
    import SessionRefreshOverlay from '../SessionRefreshOverlay.vue';

    const { toast } = useToast()
    const { isOnline } = useNetworkStatus()
    const authStore = useAuthStore()

    watch(isOnline, (online, wasOnline) => {
        if (!online)
            toast.warning("You're offline. Check your connection.")
        else if (wasOnline === false)
            toast.info("You're back online.")

    })

</script>