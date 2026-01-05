<template>
    <div class="flex flex-col p-0 md:p-4">
        <RouterLink :to="{ name: 'settings-appearance' }" class="flex items-center justify-between p-4 cursor-pointer">
            <div class="flex items-center gap-3">
                <div class="p-2 rounded-xl bg-surface-elevated transition-colors">
                    <Palette class="size-5 text-text-default" />
                </div>
                <div class="flex flex-col">
                    <span class="font-semibold text-text-default">Appearance</span>
                    <span class="text-sm text-text-muted">Customize your theme</span>
                </div>
            </div>
            <ChevronRight class="size-5 text-text-muted" />
        </RouterLink>
        <div v-if="authStore.hasAuthenticated" class="mt-8 px-4">
            <button @click="authStore.logoutSession()" :disabled="authStore.states.isLoggingOut"
                class="w-full p-4 rounded-xl bg-surface-elevated hover:bg-surface-hover active:bg-surface-active transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed text-text-default font-semibold">
                <LogOut v-if="!authStore.states.isLoggingOut" class="size-5" />
                <span>{{ authStore.states.isLoggingOut ? 'Logging out...' : 'Logout' }}</span>
            </button>
        </div>
    </div>
</template>
<script setup lang="ts">
    import { ChevronRight, Palette } from 'lucide-vue-next';
    import { useAuthStore } from '../../auth/store/authStore';
    import { LogOut } from 'lucide-vue-next'
    const authStore = useAuthStore()
</script>
