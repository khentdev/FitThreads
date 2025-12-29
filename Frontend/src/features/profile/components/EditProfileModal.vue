<template>
    <Transition enter-active-class="transition-opacity duration-200 ease-in-out"
        leave-active-class="transition-opacity duration-200 ease-in-out" enter-from-class="opacity-0"
        leave-to-class="opacity-0">
        <div v-if="props.isModalOpen"
            class="flex fixed inset-0 z-50 justify-center items-center h-full md:p-5 bg-black/30"
            @click.self="closeModal">
            <div ref="modalContainer"
                class="relative w-full h-full rounded-none md:max-w-md md:rounded-xl dark:border dark:border-border-muted md:h-auto bg-bg-primary overflow-hidden md:transition-[height] duration-300 ease-in-out">
                <div class="relative h-full md:h-auto">
                    <Transition enter-active-class="transition-transform duration-300 ease-in-out"
                        leave-active-class="absolute top-0 left-0 w-full h-full transition-transform duration-300 ease-in-out md:h-auto"
                        :enter-from-class="`${slideDirection === 'forward' ? 'translate-x-full' : '-translate-x-full'}`"
                        :leave-to-class="`${slideDirection === 'forward' ? '-translate-x-full' : 'translate-x-full z-50'}`"
                        @before-leave="onBeforeLeave" @enter="onEnter" @after-enter="onAfterEnter">
                        <div v-if="getActiveComponent('default')" key="default"
                            class="flex flex-col w-full h-full md:h-auto">
                            <div class="grid flex-1 gap-2 content-start p-5 w-full">
                                <!-- Default Header - Hidden on Medium Devices-->
                                <div class="flex justify-between items-center mb-5 md:hidden">
                                    <button @click="closeModal" :disabled="isSubmittingProfileUpdate">
                                        <Loader2 v-if="isSubmittingProfileUpdate"
                                            class="animate-spin size-5 stroke-border-strong" />
                                        <span v-else class="text-text-default">Cancel</span>
                                    </button>
                                    <h2 class="font-medium text-text-default">Edit Profile</h2>
                                    <button @click="submitProfile" :disabled="isSubmittingProfileUpdate">
                                        <Loader2 v-if="isSubmittingProfileUpdate"
                                            class="animate-spin size-5 stroke-border-strong" />
                                        <span v-else class="text-text-default">Done</span>
                                    </button>
                                </div>

                                <!-- Default Content Options -->
                                <button
                                    class="flex flex-col gap-1 pb-3 border-b cursor-pointer text-start border-b-border-muted md:pb-0 md:border-b-0"
                                    @click="navigateToBio">
                                    <h1 class="font-medium text-text-default">Bio</h1>
                                    <div class="flex gap-1 justify-between items-center">
                                        <p class="text-sm whitespace-pre-wrap break-all"
                                            :class="[bioDisplay ? 'text-text-default' : 'text-text-muted']">
                                            {{ bioDisplay || "Add a bio" }}</p>
                                        <chevron-right class="size-4 stroke-text-muted" />
                                    </div>
                                </button>
                            </div>

                            <!-- Footer -->
                            <div class="hidden mt-auto md:block">
                                <div class="w-full h-px border-b border-b-border-muted"></div>
                                <div class="p-5">
                                    <button @click="submitProfile" :disabled="isSubmittingProfileUpdate"
                                        class="flex justify-center w-full h-12 rounded-xl transition-all transform bg-solid-primary disabled:bg-surface-hover disabled:text-text-disabled disabled:cursor-not-allowed text-bg-primary hover:bg-solid-hover active:scale-95">
                                        <div class="flex gap-2 items-center">
                                            <span v-if="!isSubmittingProfileUpdate">Done</span>
                                            <template v-else>
                                                <div class="flex gap-3 items-center">
                                                    <span>Updating...</span>
                                                    <Loader2 class="animate-spin size-5 stroke-border-strong" />
                                                </div>
                                            </template>
                                        </div>
                                    </button>
                                </div>
                            </div>
                        </div>
                        <EditProfileHeader v-else-if="getActiveComponent('bio')" key="bio" headerLabel="Bio"
                            :fn="navigateFromBio" @set-active-component="setActiveComponent"
                            class="p-5 w-full h-full md:h-auto">
                            <textarea name="bio" id="bio" v-model="bioInput" placeholder="A few words about you..."
                                class="p-2 w-full h-32 rounded-md border transition-colors resize-none placeholder:text-text-muted text-text-default border-border-muted focus:border-border-strong focus:outline-none"></textarea>
                            <p class="mt-1 text-xs text-text-muted">{{ bioInput.length }}/100</p>
                        </EditProfileHeader>
                    </Transition>
                </div>
            </div>
        </div>
    </Transition>
</template>
<script setup lang="ts">
    import { Loader2, ChevronRight } from "lucide-vue-next";
    import { ref, watch } from 'vue';
    import type { UserProfile } from '../types';
    import EditProfileHeader from './EditProfileHeader.vue';

    const props = defineProps<{
        isModalOpen: boolean,
        userProfile: UserProfile | undefined,
        onSubmit: ({ bio }: { bio: string }) => Promise<any>
    }>()
    const emit = defineEmits<{ closeModal: [value: boolean] }>()
    const isSubmittingProfileUpdate = ref(false)

    type ActiveComponentOptions = "default" | "bio"
    const activeComponent = ref<ActiveComponentOptions>("default")
    const slideDirection = ref<'forward' | 'back'>('forward')

    const setActiveComponent = (value: ActiveComponentOptions) => {
        if (value === 'bio') {
            slideDirection.value = 'forward'
        } else {
            slideDirection.value = 'back'
        }
        activeComponent.value = value
    }
    const getActiveComponent = (value: ActiveComponentOptions) => activeComponent.value === value

    const bioInput = ref('')
    const bioDisplay = ref('')
    const originalBio = ref('')

    const closeModal = () => {
        bioInput.value = originalBio.value
        bioDisplay.value = originalBio.value
        activeComponent.value = "default"
        emit('closeModal', false)
    }

    watch(() => props.userProfile, () => {
        const bio = props.userProfile?.bio || ''
        bioInput.value = bio
        bioDisplay.value = bio
        originalBio.value = bio
    }, { immediate: true })

    const navigateToBio = () => {
        bioInput.value = bioDisplay.value
        setActiveComponent('bio')
    }

    const navigateFromBio = () => {
        bioDisplay.value = bioInput.value.trim()
        setActiveComponent('default')
    }

    const MAX_BIO_LENGTH = 100 // 100 characters from backend rule I made
    watch(bioInput, (newVal) => {
        if (newVal.length > MAX_BIO_LENGTH) {
            bioInput.value = newVal.substring(0, MAX_BIO_LENGTH)
        }
    })

    const submitProfile = async () => {
        if (isSubmittingProfileUpdate.value) return

        isSubmittingProfileUpdate.value = true
        try {

            const trimmedBio = bioInput.value.trim() || ""
            if (trimmedBio !== originalBio.value) {
                console.log("trimmed bio", trimmedBio, "original bio", originalBio.value)
                await props.onSubmit({ bio: trimmedBio })
            }
            closeModal()
        } catch (error) {
            // already handled by handler
        } finally {
            isSubmittingProfileUpdate.value = false
        }
    }


    const modalContainer = ref<HTMLElement | null>(null)
    const onBeforeLeave = () => {
        if (window.innerWidth < 768) return
        if (modalContainer.value) {
            modalContainer.value.style.height = `${modalContainer.value.offsetHeight}px`
        }
    }

    const onEnter = () => {
        if (window.innerWidth < 768) return
        const element = modalContainer.value
        if (!element) return

        // 1. Get the current fixed height (set in onBeforeLeave)
        const startHeight = element.style.height

        // 2. Set height to 'auto' temporarily to measure the new content's natural height
        element.style.height = "auto"
        const targetHeight = element.offsetHeight

        // 3. Reset back to the start height so the animation can begin from there
        element.style.height = startHeight

        // 4. Force the browser to process the height change (reflow)
        element.offsetHeight

        // 5. Set the final height to trigger the CSS transition
        element.style.height = `${targetHeight}px`
    }

    const onAfterEnter = () => {
        if (modalContainer.value) {
            modalContainer.value.style.height = ''
        }
    }
</script>
