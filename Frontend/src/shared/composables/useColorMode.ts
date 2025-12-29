import { useColorMode as colorMode, type BasicColorMode } from "@vueuse/core";
import { computed } from "vue";

export const useColorMode = () => {
    const { system, store } = colorMode({ storageKey: "user-theme", initialValue: "light" })

    const setTheme = (theme: BasicColorMode) => {
        store.value = theme
    }
    const currentTheme = computed(() => {
        if (store.value === "auto") return system.value
        if (store.value === "light" || store.value === "dark") return store.value
        return "light"
    })

    return { system, store, currentTheme, setTheme }
}
