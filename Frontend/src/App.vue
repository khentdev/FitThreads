<template>
    <Toast />
    <router-view v-slot="{ Component }">
        <BaseOverlay>
            <component :is="Component" />
        </BaseOverlay>
    </router-view>
</template>
<script setup>
    import { onMounted } from 'vue';
    import Toast from './shared/components/Toast.vue';
    import BaseOverlay from './shared/components/system/BaseOverlay.vue';
    import { useColorMode } from './shared/composables/useColorMode';
    const { currentTheme, setTheme } = useColorMode()
    onMounted(() => {
        setTheme(currentTheme.value)
    })
</script>