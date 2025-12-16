<template>
    <Teleport to="body">
        <Transition enter-active-class="transition-opacity duration-200 ease-out" enter-from-class="opacity-0"
            enter-to-class="opacity-100" leave-active-class="transition-opacity duration-150 ease-in"
            leave-from-class="opacity-100" leave-to-class="opacity-0">
            <div v-if="isOpen" @click.self="handleClose"
                class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
                role="dialog" aria-modal="true" :aria-labelledby="titleId">
                <Transition enter-active-class="transition-all duration-200 ease-out"
                    enter-from-class="opacity-0 scale-95" enter-to-class="opacity-100 scale-100"
                    leave-active-class="transition-all duration-150 ease-in" leave-from-class="opacity-100 scale-100"
                    leave-to-class="opacity-0 scale-95">
                    <div v-if="isOpen" @click.stop
                        class=" w-full max-w-sm bg-surface-card border border-border-muted rounded-2xl p-8 shadow-lg text-center">
                        <div class="space-y-5">
                            <h2 :id="titleId" class="text-2xl font-bold text-text-default">
                                {{ title }}
                            </h2>
                            <p class="text-sm text-text-muted leading-relaxed px-2">
                                {{ description }}
                            </p>
                            <button type="button" @click="handleContinue"
                                class="w-full px-4 py-3 bg-solid-primary text-bg-primary text-sm font-semibold rounded-xl hover:bg-solid-hover transition-opacity focus:outline-none focus:ring-2 focus:ring-text-muted focus:ring-offset-2 focus:ring-offset-surface-card">
                                Continue with FitThreads
                            </button>
                        </div>
                    </div>
                </Transition>
            </div>
        </Transition>
    </Teleport>
</template>

<script setup lang="ts">
    import { computed } from 'vue';
    import { useRouter } from 'vue-router';

    export type LoginModalPopupProps = {
        isOpen: boolean;
        context: 'create-post' | 'profile';
    }

    export type LoginModalPopupEmits = {
        (e: 'close'): void;
    }

    const props = defineProps<LoginModalPopupProps>();
    const emit = defineEmits<LoginModalPopupEmits>();

    const router = useRouter();

    const titleId = computed((): string => `login-modal-title-${props.context}`);

    const title = computed((): string => {
        return {
            'create-post': 'Share more with FitThreads',
            'profile': 'Join the community'
        }[props.context];
    });

    const description = computed((): string => {
        return {
            'create-post': 'Join FitThreads to share your fitness thoughts, read what others are thinking, and discover authentic ideas that cut through the noise.',
            'profile': 'Join FitThreads to browse fitness thoughts from real people, share your own insights, and discover a community focused on substance over style.'
        }[props.context];
    });

    const handleClose = (): void => {
        emit('close');
    };

    const handleContinue = (): void => {
        emit('close');
        router.push({ name: 'login' });
    };
</script>