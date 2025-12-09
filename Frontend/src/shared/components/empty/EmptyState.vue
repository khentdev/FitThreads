<template>
    <div class="px-4 md:px-0">
        <div class="p-12 text-center">
            <div v-if="showIcon"
                class="inline-flex items-center justify-center size-16 rounded-full bg-surface-elevated mb-4">
                <MessageSquare class="size-8 text-text-muted" />
            </div>
            <h3 v-if="title" class="text-base font-semibold text-text-default mb-2">
                {{ title }}
            </h3>
            <p class="text-sm text-text-muted max-w-md mx-auto">
                {{ message }}
            </p>
        </div>
    </div>
</template>

<script setup lang="ts">
    import { MessageSquare } from 'lucide-vue-next';

    interface Props {
        title?: string;
        message: string;
        showIcon?: boolean;
    }

    withDefaults(defineProps<Props>(), {
        title: '',
        showIcon: true
    });
</script>
