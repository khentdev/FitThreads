<template>
    <div :class="['flex gap-1 md:gap-1.5 text-sm', alignmentClass, className]">
        <span v-if="promptText" class="text-text-muted">{{ promptText }}</span>
        <router-link :to="to"
            class="font-semibold transition-colors text-text-secondary hover:text-solid-primary focus:outline-none focus:underline focus:underline-offset-2 focus:decoration-2 focus:decoration-border-focus">
            {{ linkText }}
        </router-link>
    </div>
</template>

<script setup lang="ts">
    import { computed } from 'vue';

    type AuthNavLinkProps = {
        to: string;
        linkText: string;
        promptText?: string;
        align?: 'left' | 'center' | 'right';
        className?: string;
    }

    const props = withDefaults(defineProps<AuthNavLinkProps>(), {
        align: 'center',
        className: ''
    });

    const alignmentClass = computed(() => {
        switch (props.align) {
            case 'left':
                return 'justify-start';
            case 'right':
                return 'justify-end';
            default:
                return 'justify-center';
        }
    });
</script>
