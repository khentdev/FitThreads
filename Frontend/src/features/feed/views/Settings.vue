<template>
    <FeedViewLayout title="Settings" :goPreviousPage="true">
        <RouterView />
    </FeedViewLayout>
</template>
<script setup lang="ts">
    import FeedViewLayout from '../components/FeedViewLayout.vue';
</script>