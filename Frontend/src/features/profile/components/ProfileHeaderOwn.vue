<template>
    <div class="p-5 rounded-xl  bg-surface-app">
        <div class="flex justify-between items-start mb-4">
            <div class="flex flex-col gap-1">
                <h1 class="text-2xl font-bold text-text-default">@{{ profile?.username }}</h1>
                <p class="text-sm text-text-muted">Joined {{ formatDate(profile?.joinedAt) }}</p>
            </div>
            <button @click="toggleEditModal(true)"
                class="px-4 py-2 text-sm font-medium rounded-lg transform transition-all active:scale-90 duration-150 ease-in-out border border-border-muted text-text-default hover:bg-surface-hover ">
                Edit Profile
            </button>
        </div>

        <div v-if="profile?.bio" class="mb-6">
            <p class="text-[15px] leading-relaxed text-text-default whitespace-pre-wrap ">{{ profile.bio }}</p>
        </div>

        <div class="flex gap-6 pt-4">
            <div class="flex gap-2 items-center">
                <span class="font-bold text-text-default">{{ formatCompactNumber(profile?.totalLikes) }}</span>
                <span class="text-sm text-text-muted">Likes</span>
            </div>
        </div>
    </div>
    <EditProfileModal :is-modal-open="isProfileModalOpen" @close-modal="toggleEditModal" :user-profile="profile"
        :on-submit="handleSubmitProfile" />
</template>
<script setup lang="ts">
    import { ref } from 'vue';
    import { formatCompactNumber } from '../../../shared/utils/numberUtils';
    import { useProfileStore } from '../store/profileStore';
    import type { UserProfile } from '../types';
    import EditProfileModal from './EditProfileModal.vue';

    const profileStore = useProfileStore()

    defineProps<{ profile: UserProfile | undefined }>()

    const formatDate = (dateStr: string | undefined) => {
        if (!dateStr) return '';
        return new Date(dateStr).toLocaleDateString(undefined, {
            month: 'long',
            year: 'numeric'
        });
    }

    const isProfileModalOpen = ref(false)
    const toggleEditModal = (val: boolean) => {
        isProfileModalOpen.value = val
    }

    const handleSubmitProfile = async ({ bio }: { bio: string }) =>
        await profileStore.updateProfile({ bio })


</script>
