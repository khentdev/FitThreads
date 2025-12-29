<template>
    <div class="flex flex-col gap-6 p-5">
        <div class="flex flex-col gap-3">
            <div class="flex flex-col gap-1">
                <h3 class="text-base font-bold text-text-default">Theme</h3>
                <p class="text-sm text-text-muted">Choose your preferred color scheme</p>
            </div>

            <div class="flex gap-3">
                <button @click="setTheme('light')" :class="[
                    'flex-1 flex flex-col items-center gap-3 p-4 rounded-xl border-2 transition-all',
                    currentTheme === 'light'
                        ? 'border-solid-primary bg-component-base'
                        : 'border-border-muted bg-surface-elevated hover:bg-surface-hover hover:border-border-strong'
                ]" class="active:scale-[0.98]">
                    <div :class="[
                        'p-3 rounded-full transition-colors',
                        currentTheme === 'light'
                            ? 'bg-solid-primary text-white'
                            : 'bg-surface-active text-text-default'
                    ]">
                        <Sun class="size-6" />
                    </div>
                    <div class="flex flex-col gap-1 items-center">
                        <span :class="[
                            'font-semibold text-sm',
                            currentTheme === 'light' ? 'text-text-primary' : 'text-text-default'
                        ]">
                            Light
                        </span>
                        <span class="text-xs text-text-muted">Warm & bright</span>
                    </div>
                </button>

                <button @click="setTheme('dark')" :class="[
                    'flex-1 flex flex-col items-center gap-3 p-4 rounded-xl border-2 transition-all',
                    currentTheme === 'dark'
                        ? 'border-solid-primary bg-component-base'
                        : 'border-border-muted bg-surface-elevated hover:bg-surface-hover hover:border-border-strong'
                ]" class="active:scale-[0.98]">
                    <div :class="[
                        'p-3 rounded-full transition-colors',
                        currentTheme === 'dark'
                            ? 'bg-solid-primary text-white'
                            : 'bg-surface-active text-text-default'
                    ]">
                        <Moon class="size-6" />
                    </div>
                    <div class="flex flex-col gap-1 items-center">
                        <span :class="[
                            'font-semibold text-sm',
                            currentTheme === 'dark' ? 'text-text-primary' : 'text-text-default'
                        ]">
                            Dark
                        </span>
                        <span class="text-xs text-text-muted">Cool & sleek</span>
                    </div>
                </button>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
    import { Moon, Sun } from 'lucide-vue-next';
    import { useColorMode } from '../../../shared/composables/useColorMode';
    const { setTheme, currentTheme } = useColorMode()
</script>
