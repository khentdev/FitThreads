<template>
    <div class="sticky top-0 z-30 w-full backdrop-blur-3xl max-w-[640px] bg-surface-app/85">
        <div class="max-w-[640px] mx-auto w-full h-14 relative flex justify-center items-center px-4 md:px-0">
            <button @click="actionFn?.()" class="text-lg font-bold text-text-default">{{ title }}</button>
        </div>
    </div>
</template>

<script setup lang="ts">
    defineProps<{
        title: string
        actionFn?: () => void
    }>()
</script>
