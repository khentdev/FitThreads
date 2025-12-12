<template>
    <ProfileViewLayout title="Profile">
        <ErrorRetry :retry-fn="profileStore.retryFetchProfile" v-if="errors.serverError || errors.profileFetchFailed" />
        <!-- Loading indicator for profile here -->
        <Loader2 class="animate-spin size-5 stroke-border-strong" v-else-if="profileStore.profileQuery.isPending" />
        <template v-else>
            <div class="md:border md:rounded-xl md:border-border-muted">
                <ProfileHeaderOwn v-if="isOwnProfile" :profile="profileStore.profileQuery.data" />
                <ProfileHeaderOther v-else :profile="profileStore.profileQuery.data" />
                <div class="pb-20">
                    <div class="w-full flex justify-between h-full gap-4">
                        <ProfileTabNavLink to="profile-thoughts" label="Thoughts" />
                        <ProfileTabNavLink to="profile-favorites" label="Favorites" />
                    </div>
                    <div class="md:mt-4 px-0">
                        <!-- This is only sample for post thoughts styles here -->
                        <div class="p-5 border-b border-b-border-muted bg-surface-app">
                            <div class="flex gap-3 mb-3">
                                <div class="flex flex-col">
                                    <span class="font-bold text-[15px] text-text-default">@khent</span>
                                    <span class="text-xs text-text-muted">1 hour ago</span>
                                </div>
                            </div>

                            <h2 class="text-lg font-bold text-text-default mb-2 wrap-break-word">
                                Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quod.
                            </h2>

                            <div class="mb-4">
                                <p class="text-[15px] leading-relaxed text-text-default wrap-break-word">
                                    Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quod.
                                </p>
                            </div>

                            <div v-if="true" class="flex flex-wrap gap-2 mb-4">
                                <span
                                    class="px-3 py-1 text-xs font-medium rounded-full bg-surface-elevated text-text-muted">
                                    #Lorem
                                </span>
                            </div>

                            <div class="flex gap-6">
                                <div
                                    class="flex gap-2 items-center transition-colors cursor-pointer text-text-muted hover:text-orange-500 group">
                                    <Flame class="w-5 h-5 group-hover:fill-orange-500/20" />
                                    <span class="text-sm font-medium">10</span>
                                </div>
                                <div
                                    class="flex gap-2 items-center transition-colors cursor-pointer text-text-muted hover:text-blue-500 group">
                                    <Bookmark class="w-5 h-5 group-hover:fill-blue-500/20" />
                                    <span class="text-sm font-medium">10</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </template>
    </ProfileViewLayout>
</template>
<script setup lang="ts">
    import ProfileViewLayout from '../components/ProfileViewLayout.vue';
    import ProfileTabNavLink from '../components/ProfileTabNavLink.vue';
    import { useProfileStore } from '../store/profileStore';
    import { useRoute, useRouter } from 'vue-router';
    import { Bookmark, Loader2, Flame } from "lucide-vue-next"
    import ErrorRetry from '../../../shared/components/error/ErrorRetry.vue';
    import ProfileHeaderOther from '../components/ProfileHeaderOther.vue';
    import ProfileHeaderOwn from '../components/ProfileHeaderOwn.vue';
    import { useAuthStore } from '../../auth/store/authStore';
    import { storeToRefs } from 'pinia';
    import { watch } from 'vue';

    const router = useRouter()
    const route = useRoute()

    const authStore = useAuthStore()
    const profileStore = useProfileStore()

    const { isOwnProfile, errors } = storeToRefs(profileStore)

    watch(() => route.params['username'], (newUsername) => {
        if (newUsername)
            profileStore.setViewedProfile(newUsername as string)
    }, { immediate: true })

    /**
     * For unauthorized user:
     * - If profile is not found, redirect to login page
     * - If profile is found, show profile
     */
    /**
     * For authorized user:
     * - If profile is not found, redirect to not-found page
     * - If profile is found, show profile
     */
    watch([errors, () => authStore.hasAuthenticated], ([err, authenticated]) => {
        if (err.profileNotFound) {
            if (authenticated) router.push({ name: "not-found" });
            else router.push({ name: "login", query: { next: route.fullPath } });
        }
    }, { deep: true })
</script>
