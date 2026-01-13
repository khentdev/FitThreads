<template>
    <div class="flex h-screen w-full bg-surface-app">
        <Header @scrollToTop="handleScrollToTop" />
        <main class="flex-1 h-full w-full overflow-y-scroll relative pb-16 md:pb-0" @scroll="handleFeedScroll"
            ref="scrollContainerRef">
            <RouterView v-slot="{ Component, route }">
                <component :is="Component" :key="route.name"></component>
            </RouterView>
        </main>
        <LoginModalPopup :is-open="isModalOpen()" :context="modalContext()" @close="closeModal" />
    </div>
</template>

<script setup lang="ts">
import {  watch} from 'vue';
import { RouterView, useRoute } from 'vue-router';
import Header from '../../features/feed/components/Header.vue';
import LoginModalPopup from '../../shared/components/LoginModalPopup.vue';
import { useLoginModal } from '../../shared/composables/useLoginModal';
import { useScroll } from '../../shared/composables/useScroll';

    const route = useRoute()
    const { isOpen: isModalOpen, context: modalContext, closeModal } = useLoginModal()
    const { handleScroll, restoreScrollPosition, scrollContainerRef } = useScroll({ scrollKey: "feedScrollPosition" })

    const handleFeedScroll = (e: Event) =>{
        if(route.name !== 'feed') return
        handleScroll(e)
    }

    const handleScrollToTop = () => {
        if (scrollContainerRef.value) {
            scrollContainerRef.value.scrollTo({ top: 0, behavior: 'smooth' })
        }
    }

    watch(() => route.name, async (newRouteName, oldRouteName) => {
        if (newRouteName === 'feed') {
            await restoreScrollPosition()
        } else if (oldRouteName === 'feed' && scrollContainerRef.value) {
            scrollContainerRef.value.scrollTop = 0
        }
    })

   
</script>