<template>
    <Teleport to="body">
        <Transition enter-active-class="transition-opacity duration-200 ease-out" enter-from-class="opacity-0"
            enter-to-class="opacity-100" leave-active-class="transition-opacity duration-200 ease-in"
            leave-from-class="opacity-100" leave-to-class="opacity-0">
            <div class="fixed inset-0 z-100 flex items-center justify-center bg-surface-app/80 backdrop-blur-sm"
                role="alert" aria-live="polite" aria-label="Refreshing session">

                <div class="flex flex-col items-center gap-8 px-6">
                    <h1 class="text-4xl font-extrabold text-text-default">FitThreads</h1>
                    <div class="flex flex-col items-center gap-4">
                        <div class="flex items-center gap-2.5" aria-hidden="true">
                            <span
                                class="w-3 h-3 rounded-full bg-solid-primary animate-[pulse_1.4s_ease-in-out_infinite]"></span>
                            <span
                                class="w-3 h-3 rounded-full bg-solid-primary animate-[pulse_1.4s_ease-in-out_0.2s_infinite]"></span>
                            <span
                                class="w-3 h-3 rounded-full bg-solid-primary animate-[pulse_1.4s_ease-in-out_0.4s_infinite]"></span>
                        </div>
                    </div>
                </div>
            </div>
        </Transition>
    </Teleport>
</template>
