<template>
    <Teleport to="body">
        <Transition enter-active-class="transition-opacity duration-200 ease-out" enter-from-class="opacity-0"
            enter-to-class="opacity-100" leave-active-class="transition-opacity duration-200 ease-in"
            leave-from-class="opacity-100" leave-to-class="opacity-0">
            <div class="flex fixed inset-0 justify-center items-center backdrop-blur-sm z-100 bg-surface-app"
                role="alert" aria-live="polite" aria-label="Refreshing session">
                <div class="flex flex-col gap-8 items-center px-6">
                    <h1 class="text-4xl font-extrabold text-text-default">FitThreads</h1>
                    <div class="flex flex-col gap-4 items-center">
                        <div class="flex gap-2.5 items-center" aria-hidden="true">
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
