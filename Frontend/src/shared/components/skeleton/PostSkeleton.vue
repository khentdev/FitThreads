<template>
    <div class="flex flex-col gap-4 px-4 md:px-0">
        <div v-for="i in count" :key="i" class="p-5 rounded-xl border border-border-muted bg-surface-app animate-pulse">
            <div class="flex gap-3 mb-3">
                <div class="h-4 bg-surface-elevated rounded w-32"></div>
            </div>

            <div class="mb-4 space-y-2">
                <div class="h-4 bg-surface-elevated rounded w-full"></div>
                <div class="h-4 bg-surface-elevated rounded w-11/12"></div>
                <div class="h-4 bg-surface-elevated rounded w-4/5"></div>
            </div>

            <div class="flex gap-2 mb-4">
                <div class="h-6 bg-surface-elevated rounded-full w-20"></div>
                <div class="h-6 bg-surface-elevated rounded-full w-24"></div>
                <div class="h-6 bg-surface-elevated rounded-full w-16"></div>
            </div>

            <div class="flex gap-6">
                <div class="h-5 bg-surface-elevated rounded w-12"></div>
                <div class="h-5 bg-surface-elevated rounded w-12"></div>
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
