import { reactive } from "vue";
import { defineStore } from "pinia";

export const useGlobalLoadingState = defineStore("loadingStateGlobal", () => {
    const isLoading = reactive<Record<string, boolean>>({})
    const setLoading = <T extends string = string>(feature: T, type: T, value: boolean) => {
        const key = `${feature}-${type}`
        isLoading[key] = value
    }
    return { setLoading, isLoading }
})

export const useGlobalErrorState = defineStore("errorStateGlobal", () => {
    const getError = reactive<Record<string, boolean>>({})
    const setError = <T extends string = string>(feature: T, type: T, value: boolean) => {
        const key = `${feature}-${type}`
        getError[key] = value
    }
    return { getError, setError }
})
