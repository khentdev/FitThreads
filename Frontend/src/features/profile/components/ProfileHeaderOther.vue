<template>
    <div class="p-5 rounded-xl  bg-surface-app">
        <div class="flex justify-between items-start mb-4">
            <div class="flex flex-col gap-1">
                <h1 class="text-2xl font-bold text-text-default">@{{ profile?.username }}</h1>
                <p class="text-sm text-text-muted">Joined {{ formatDate(profile?.joinedAt) }}</p>
            </div>
        </div>

        <div v-if="profile?.bio" class="mb-6">
            <p class="text-[15px] leading-relaxed text-text-default whitespace-pre-wrap">{{ profile.bio }}</p>
        </div>

        <div class="flex gap-6 pt-4">
            <div class="flex gap-2 items-center">
                <span class="font-bold text-text-default">{{ formatCompactNumber(profile?.totalLikes) }}</span>
                <span class="text-sm text-text-muted">Likes</span>
            </div>
        </div>
    </div>
</template>
<script setup lang="ts">
    import type { UserProfile } from '../types';
    import { formatCompactNumber } from '../../../shared/utils/numberUtils';

    const props = defineProps<{ profile: UserProfile | undefined }>()

    const formatDate = (dateStr: string | undefined) => {
        if (!dateStr) return '';
        return new Date(dateStr).toLocaleDateString(undefined, {
            month: 'long',
            year: 'numeric'
        });
    }
</script>
