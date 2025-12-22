<template>
    <ProfileViewLayout title="Profile">
        <ErrorRetry :retry-fn="profileStore.retryFetchProfile" v-if="errors.serverError || errors.profileFetchFailed" />
        <div v-else-if="profileStore.profileQuery.isPending"
            class="flex justify-center items-center absolute inset-0">
            <Loader2 class="animate-spin size-5 stroke-border-strong" />
        </div>
        <template v-else>
            <ProfileHeaderOwn v-if="isOwnProfile" :profile="profileStore.profileQuery.data" />
            <ProfileHeaderOther v-else :profile="profileStore.profileQuery.data" />
            <div class="w-full flex justify-between h-full gap-4">
                <ProfileTabNavLink to="profile-thoughts" label="Thoughts" />
                <ProfileTabNavLink to="profile-favorites" label="Favorites" />
            </div>
            <router-view />
        </template>
    </ProfileViewLayout>
</template>
<script setup lang="ts">
    import ProfileViewLayout from '../components/ProfileViewLayout.vue';
    import ProfileTabNavLink from '../components/ProfileTabNavLink.vue';
    import { useProfileStore } from '../store/profileStore';
    import { useRoute, useRouter } from 'vue-router';
    import { Loader2, } from "lucide-vue-next"
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
    watch([() => errors.value.profileNotFound, () => authStore.hasAuthenticated], ([err, authenticated]) => {
        if (err) {
            if (authenticated) router.push({ name: "not-found" });
            else router.push({ name: "login", query: { next: route.fullPath } });
        }
    }, { immediate: true })
</script>
