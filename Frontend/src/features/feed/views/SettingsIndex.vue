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
    </div>
</template>
<script setup lang="ts">
    import { ChevronRight, Palette } from 'lucide-vue-next';
</script>
