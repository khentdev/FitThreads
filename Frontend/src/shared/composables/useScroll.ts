import { nextTick, onBeforeUnmount, onMounted, ref } from "vue";

export type ScrollParams = {
    scrollKey: string
}
export const useScroll = ({ scrollKey }: ScrollParams) => {
    const scrollContainerRef = ref<HTMLDivElement | null>(null)

    const getScrollPosition = () => sessionStorage.getItem(scrollKey)
    const handleScroll = (e: Event) => {
        scrollContainerRef.value = e.target as HTMLDivElement
        sessionStorage.setItem(scrollKey, scrollContainerRef.value?.scrollTop.toString())
    }

    const restoreScrollPosition = async () => {
        if (getScrollPosition() && scrollContainerRef.value) {
            await nextTick()
            scrollContainerRef.value.scrollTo({ top: Number(getScrollPosition()), behavior: "instant" })
        }
    }

    const removeScroll = () => {
        sessionStorage.removeItem(scrollKey)
    }

    onMounted(() => {
        removeScroll()
    })
    onBeforeUnmount(() => {
        removeScroll()
    })

    return { handleScroll, getScrollPosition, restoreScrollPosition, removeScroll, scrollContainerRef }
}