<template>
    <div class="px-4 md:px-0">
        <div class="max-w-md mx-auto py-16 text-center">
            <h3 v-if="title" class="text-lg font-semibold text-text-default mb-3">
                {{ title }}
            </h3>
            <p class="text-sm text-text-muted leading-relaxed mb-4 max-w-sm mx-auto">
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
        message: string;
        retryable?: boolean;
        retryText?: string;
        isRetrying?: boolean
        retryFn?: () => void
    }

    const props = withDefaults(defineProps<Props>(), {
        title: '',
        retryable: true,
        retryText: 'Try Again',
    });
</script>
