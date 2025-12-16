<template>
    <div class="flex flex-col items-center w-full min-h-full">
        <PageHeader :title="title" />
        <div
            class="w-full max-w-[640px] pb-8 md:px-0 flex-1 flex flex-col md:border rounded-xl rounded-b-none border-border-muted">
            <slot />
        </div>
    </div>
</template>

<script setup lang="ts">
    import PageHeader from './PageHeader.vue';
    defineProps<{
        title: string
    }>();
</script>
