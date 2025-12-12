<template>
    <div class="flex flex-col justify-center items-center w-full min-h-full">
        <PageHeader :title="title" />
        <div class="w-full max-w-[640px] pb-20 h-full items-center justify-center md:px-0 flex-1 flex flex-col">
            <slot />
        </div>
    </div>
</template>
<script setup lang="ts">
    import PageHeader from '../../feed/components/PageHeader.vue';
    defineProps<{ title: string }>();
    /**
    * I will render back icon if other's profile, it own profile -> no back icon
    */
</script>