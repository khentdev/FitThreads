<template>
    <div>
        <div class="flex justify-between items-center mb-5">
            <button @click="backToDefault"><arrow-left class="size-5 text-text-default" /></button>
            <h2 class="font-medium text-text-default">{{ headerLabel }}</h2>
            <button @click="fn?.()" class="text-text-default">Done</button>
        </div>
        <slot></slot>
    </div>
</template>
<script lang="ts" setup>
    import { ArrowLeft } from "lucide-vue-next";

    defineProps<{ headerLabel: string, fn?: () => void }>()

    type ActiveComponentOptions = "default" | "bio"
    const emit = defineEmits<{ setActiveComponent: [value: ActiveComponentOptions] }>()
    const backToDefault = () => {
        emit('setActiveComponent', 'default')
    }
</script>