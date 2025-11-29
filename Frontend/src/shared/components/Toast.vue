<template>
    <Teleport to="body">
        <TransitionGroup tag="div" enter-active-class="transition-all duration-300 ease-out"
            enter-from-class="opacity-0 translate-x-full" enter-to-class="opacity-100 translate-x-0"
            leave-active-class="transition-opacity duration-200 ease-in" leave-from-class="opacity-100"
            leave-to-class="opacity-0" move-class="transition-transform duration-300 ease-out"
            class="fixed bottom-0 right-0 sm:bottom-4 sm:right-4 z-50 flex flex-col gap-3 w-full max-w-sm pointer-events-none px-4 py-2 sm:p-0">
            <div v-for="toast in toasts" :key="toast.id" :class="[
                'pointer-events-auto w-full rounded-lg p-4 shadow-sm border backdrop-blur-sm flex items-start gap-3',
                toastVariantClasses(toast.type)
            ]" role="alert" :aria-live="toast.type === 'error' ? 'assertive' : 'polite'">
                <div class="shrink-0 mt-0.5">
                    <component :is="getIconVariants(toast.type)" :key="toast.id" class="w-5 h-5" aria-hidden="true" />
                </div>
                <div class="flex-1 min-w-0">
                    <p v-if="toast.title" class="text-base font-semibold text-text-default mb-1">
                        {{ toast.title }}
                    </p>
                    <p :class="toast.title ? 'text-sm text-text-muted' : 'text-sm font-medium text-text-default'">
                        {{ toast.message }}
                    </p>
                </div>

                <button type="button" @click="removeToast(toast.id)"
                    class="shrink-0 -mr-1 -mt-1 p-1 rounded hover:bg-black/5 dark:hover:bg-white/5 transition-colors focus:outline-none"
                    aria-label="Close notification">
                    <XIcon class="w-4 h-4" aria-hidden="true" />
                </button>
            </div>
        </TransitionGroup>
    </Teleport>
</template>

<script setup lang="ts">
    import { useToast } from '../composables/toast/useToast';
    import {
        CheckCircle as CheckCircleIcon,
        AlertCircle as AlertCircleIcon,
        AlertTriangle as AlertTriangleIcon,
        Info as InfoIcon,
        X as XIcon
    } from 'lucide-vue-next';
    import type { ToastType } from '../composables/toast/types';

    const { toasts, removeToast } = useToast();

    const toastVariantClasses = (type: ToastType): string => {
        return {
            success: 'bg-surface-card/95 border-border-muted text-text-default [&_svg]:text-text-muted',
            error: 'bg-surface-card/95 border-red-200/60 text-text-default [&_svg]:text-red-600 dark:border-red-800/40 dark:[&_svg]:text-red-400',
            warning: 'bg-surface-card/95 border-amber-200/60 text-text-default [&_svg]:text-amber-600 dark:border-amber-800/40 dark:[&_svg]:text-amber-400',
            info: 'bg-surface-card/95 border-border-muted text-text-default [&_svg]:text-text-muted'
        }[type];
    };

    const getIconVariants = (type: ToastType) => {
        return {
            success: CheckCircleIcon,
            error: AlertCircleIcon,
            warning: AlertTriangleIcon,
            info: InfoIcon
        }[type]
    };
</script>