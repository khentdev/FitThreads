<template>
    <div class="px-4 md:px-0">
        <div class="py-16 mx-auto max-w-md text-center">
            <h3 v-if="title" class="mb-3 text-lg font-semibold text-text-default">
                {{ title }}
            </h3>
            <p class="mx-auto mb-4 max-w-sm text-sm leading-relaxed text-text-muted">
                {{ message }}
            </p>
            <button v-if="retryable" @click="retryFn?.()" :disabled="isRetrying"
                class="px-6 py-3 rounded-xl border border-border-muted bg-surface-app text-text-default font-medium text-sm transition-all hover:bg-surface-elevated active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-surface-app">
                {{ isRetrying ? 'Retrying...' : retryText }}
            </button>
        </div>
    </div>
</template>

<script setup lang="ts">
    type Props = {
        title?: string;
        message?: string;
        retryable?: boolean;
        retryText?: string;
        isRetrying?: boolean
        retryFn?: () => void
    }

    withDefaults(defineProps<Props>(), {
        title: '',
        message: "Something went wrong. Please check your connection and try again.",
        retryable: true,
        retryText: 'Try Again',
    });
</script>
