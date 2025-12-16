<template>
    <div class="flex h-screen w-full bg-surface-app">
        <Header />
        <main class="flex-1 h-full w-full overflow-y-scroll relative pb-16 md:pb-0" @scroll="handleScroll"
            ref="scrollContainer">
            <RouterView v-slot="{ Component, route }">
                <component :is="Component" :key="route.name"></component>
            </RouterView>
        </main>
    </div>
</template>

<script setup lang="ts">
    import { RouterView, useRoute } from 'vue-router'
    import Header from '../../features/feed/components/Header.vue';
    import { onMounted, ref, watch, nextTick, type Ref, onBeforeUnmount } from 'vue';

    const route = useRoute()
    const scrollContainer: Ref<HTMLDivElement | null> = ref(null)

    const handleScroll = (e: Event) => {
        if (route.name !== 'feed') return;
        const scrollContainer = e.target as HTMLDivElement
        sessionStorage.setItem("feedScrollPosition", scrollContainer.scrollTop.toString())
    }

    const restoreFeedScroll = async (): Promise<void> => {
        if (route.name === 'feed') {
            const lastScroll = sessionStorage.getItem("feedScrollPosition")
            if (lastScroll && scrollContainer.value) {
                await nextTick()
                scrollContainer.value?.scrollTo({
                    top: Number(lastScroll),
                    behavior: "instant"
                })
            }
        }
    }

    onMounted(() => {
        sessionStorage.removeItem("feedScrollPosition")
    })

    onBeforeUnmount(() => {
        sessionStorage.removeItem("feedScrollPosition")
    })

    watch(() => route.name, async (newRouteName, oldRouteName) => {
        if (newRouteName === 'feed') {
            await restoreFeedScroll()
        } else if (oldRouteName === 'feed' && scrollContainer.value) {
            scrollContainer.value.scrollTop = 0
        }
    })

</script>