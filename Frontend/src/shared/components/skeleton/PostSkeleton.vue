<template>
    <div class="flex flex-col px-0">
        <div v-for="i in count" :key="i" class="p-5 border-b border-border-muted bg-surface-app rounded-xl animate-pulse">
            <!-- Header: Username and Date -->
            <div class="flex gap-3 mb-3">
                <div class="flex flex-col gap-1">
                    <div class="h-4 bg-surface-elevated rounded w-32"></div>
                    <div class="h-3 bg-surface-elevated rounded w-20"></div>
                </div>
            </div>

            <!-- Title -->
            <div class="h-6 bg-surface-elevated rounded w-3/4 mb-2"></div>

            <!-- Content -->
            <div class="mb-4 space-y-2">
                <div class="h-4 bg-surface-elevated rounded w-full"></div>
                <div class="h-4 bg-surface-elevated rounded w-11/12"></div>
                <div class="h-4 bg-surface-elevated rounded w-4/5"></div>
            </div>

            <!-- Tags -->
            <div class="flex gap-2 mb-4">
                <div class="h-6 bg-surface-elevated rounded-full w-16"></div>
                <div class="h-6 bg-surface-elevated rounded-full w-20"></div>
                <div class="h-6 bg-surface-elevated rounded-full w-14"></div>
            </div>

            <!-- Actions -->
            <div class="flex gap-6">
                <div class="flex gap-2 items-center">
                    <div class="w-5 h-5 bg-surface-elevated rounded-full"></div>
                    <div class="h-4 bg-surface-elevated rounded w-6"></div>
                </div>
                <div class="flex gap-2 items-center">
                    <div class="w-5 h-5 bg-surface-elevated rounded-full"></div>
                    <div class="h-4 bg-surface-elevated rounded w-6"></div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
    interface Props {
        count?: number;
    }

    withDefaults(defineProps<Props>(), {
        count: 5
    });
</script>
