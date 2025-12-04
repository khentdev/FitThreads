<template>
    <Teleport to="body">
        <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-surface-app/95 backdrop-blur-sm"
            role="dialog" aria-labelledby="error-title" aria-describedby="error-description">
            <div
                class="container flex flex-col gap-6 justify-center p-10 rounded-lg shadow-md sm:max-w-md md:max-w-lg bg-surface-card">
                <div class="flex flex-col gap-4 items-center text-center">
                    <div class="flex items-center justify-center">
                        <AlertCircleIcon class="size-12 text-red-500 stroke-[1.5]" aria-hidden="true" />
                    </div>

                    <div class="flex flex-col gap-2">
                        <h2 id="error-title" class="text-2xl font-bold text-text-default">
                            Something went wrong
                        </h2>

                        <p id="error-description" class="text-text-muted">
                            We're having trouble connecting right now. Give it another try.
                        </p>
                    </div>
                </div>

                <button type="button" @click="handleRetry"
                    class="h-14 font-bold rounded-lg transition-colors bg-solid-primary hover:bg-solid-hover text-bg-primary focus:outline-none focus:border-2 focus:border-white focus:ring-2 focus:ring-border-focus">
                    Reload Page
                </button>
            </div>
        </div>
    </Teleport>
</template>

<script setup lang="ts">
    import { AlertCircle as AlertCircleIcon } from 'lucide-vue-next';
    const handleRetry = (): void => {
        window.location.reload()
    };
</script>