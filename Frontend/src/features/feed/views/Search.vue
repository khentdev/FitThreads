<template>
    <FeedViewLayout title="Search">
        <div class="flex flex-col">
            <div class="p-5 pb-0">
                <form class="flex relative items-center" @submit.prevent="handleSearchQuery">
                    <Search class="absolute left-5 pointer-events-none size-5 text-border-strong" />
                    <input type="search" enterkeyhint="search" id="search-input"
                        class="pr-5 pl-12 w-full h-12 bg-transparent rounded-2xl border border-border-muted focus:outline-none text-text-default placeholder:text-text-muted"
                        placeholder="Search" v-model="searchInput">
                </form>
            </div>
            <template v-if="hasSearched">
                <div class="flex gap-4 mt-4 w-full">
                    <button v-for="tab in tabs" :key="tab.id" @click="handleTabClick(tab)" :class="[
                        activeFilter === tab.id
                            ? 'border-b border-text-default text-text-default'
                            : 'border-b border-transparent text-text-muted hover:text-text-default',
                        'flex-1 h-12 relative grid place-items-center transition-colors duration-200 group -mb-px'
                    ]">
                        <span class="transition-transform duration-150 ease-in-out transform group-active:scale-90"
                            :class="activeFilter === tab.id ? 'font-bold' : 'font-medium'">
                            {{ tab.label }}
                        </span>
                    </button>
                </div>

                <div class="flex flex-col mt-4" v-if="(activeFilter === 'top' || activeFilter === 'recent')">
                    <PostSkeleton v-if="searchFeed.isLoading.value" />
                    <ErrorRetry v-else-if="searchFeed.isError.value" :message="searchFeed.errorMessage.value"
                        :is-retrying="searchFeed.isRefetching.value" :retryFn="handleTryAgainFeed" />
                    <EmptyState v-else-if="feedResults.length === 0" title="No posts found"
                        message="Try searching for something else." />
                    <div v-else v-for="post in feedResults" :key="post.id"
                        class="p-5 rounded-xl rounded-b-none border-b border-border-muted bg-surface-app">
                        <div class="flex gap-3 mb-3">
                            <div class="flex flex-col">
                                <span
                                    @click="router.push({ name: 'profile', params: { username: post.author.username } })"
                                    class="font-bold text-[15px] text-text-default hover:underline hover:underline-offset-1 cursor-pointer active:text-text-muted transition-colors">@{{
                                        post.author.username
                                    }}</span>
                                <span class="text-xs text-text-muted">{{ formatDate(post.createdAt) }}</span>
                            </div>
                        </div>
                        <h2 class="mb-2 text-lg font-bold text-text-default wrap-break-word">
                            {{ post.title }}
                        </h2>
                        <div class="mb-4">
                            <p class="text-[15px] leading-relaxed text-text-default wrap-break-word">
                                {{ post.content }}
                            </p>
                        </div>
                        <div class="flex flex-wrap gap-2 mb-4">
                            <span v-for="tag in post.postTags" :key="tag.tag.name"
                                class="px-3 py-1 text-xs font-medium rounded-full bg-surface-elevated text-text-muted">
                                #{{ tag.tag.name }}
                            </span>
                        </div>
                        <div class="flex gap-6">
                            <button @click="handleToggleLike({ postId: post.id })"
                                class="flex gap-2 rounded-xl p-2 like-button items-center transition-all cursor-pointer text-text-muted active:scale-90 hover:bg-surface-elevated group">
                                <Flame class="size-5 like-icon group-active:stroke-red-500 group-active:fill-red-500"
                                    :class="{ 'fill-red-500 stroke-red-500': post.hasLikedByUser }" />
                                <span class="text-sm font-medium group-active:text-red-500"
                                    :class="{ 'text-red-500': post.hasLikedByUser }">{{ post._count.likes }}</span>
                            </button>
                            <button @click="handleToggleFavorite({ postId: post.id })"
                                class="flex gap-2 rounded-xl p-2 favorite-button items-center transition-all cursor-pointer text-text-muted active:scale-90 hover:bg-surface-elevated group">
                                <Bookmark
                                    class="size-5 favorite-icon group-active:stroke-orange-500 group-active:fill-orange-500"
                                    :class="{ 'fill-orange-500 stroke-orange-500': post.hasFavoritedByUser }" />
                                <span class="text-sm font-medium group-active:text-orange-500"
                                    :class="{ 'text-orange-500': post.hasFavoritedByUser }">{{ post._count.favorites
                                    }}</span>
                            </button>
                        </div>
                    </div>
                    <template v-if="!searchFeed.isError.value">
                        <EmptyState v-if="!searchFeed.hasNextPage.value && feedResults.length > 0"
                            title="You're all caught up!"
                            message="That's all the posts for now. Check back later for more fitness thoughts."
                            :show-icon="false" />
                        <button v-if="searchFeed.hasNextPage.value" @click="handleLoadMoreFeed"
                            :disabled="!searchFeed.hasNextPage.value || searchFeed.isFetchingNextPage.value"
                            class="px-6 py-3 mx-4 mt-4 font-medium rounded-xl border transition-colors border-border-muted bg-surface-app text-text-default hover:bg-surface-elevated disabled:opacity-50 disabled:cursor-not-allowed">
                            {{ searchFeed.isFetchingNextPage.value ? 'Loading...' : 'Load More' }}
                        </button>
                    </template>
                </div>

                <div class="flex flex-col mt-4" v-if="activeFilter === 'profile'">
                    <ProfileSearchSkeleton v-if="searchProfiles.isLoading.value" :count="10"/>
                    <ErrorRetry v-else-if="searchProfiles.isError.value" :message="searchProfiles.errorMessage.value"
                        :is-retrying="searchProfiles.isRefetching.value" :retryFn="handleTryAgainProfile" />
                    <EmptyState v-else-if="profileResults.length === 0" title="No profiles found"
                        message="Try searching for a different username." />
                    <div v-else class="flex flex-col">
                        <div v-for="profile in profileResults" :key="profile.username"
                            @click="() => router.push({ name: 'profile', params: { username: profile.username } })"
                            class="flex flex-col justify-center px-5 py-4 border-b transition-colors cursor-pointer min-h-[72px] border-border-muted">
                            <div class="flex flex-col gap-1">
                                <span
                                    class="font-bold text-[15px] w-fit text-text-default hover:underline hover:underline-offset-1 cursor-pointer active:text-text-muted transition-colors">@{{
                                        profile.username
                                    }}</span>
                                <p v-if="profile.bio" class="text-[15px] text-text-muted line-clamp-1">
                                    {{ profile.bio }}
                                </p>
                            </div>
                        </div>
                    </div>
                    <template v-if="!searchProfiles.isError.value">
                        <EmptyState v-if="!searchProfiles.hasNextPage.value && profileResults.length > 0"
                            title="You're all caught up!"
                            message="That's all the profiles for now. Check back later for more profiles."
                            :show-icon="false" />
                        <button v-else-if="searchProfiles.hasNextPage.value" @click="handleLoadMoreProfile"
                            :disabled="!searchProfiles.hasNextPage.value || searchProfiles.isFetchingNextPage.value"
                            class="px-6 py-3 mx-4 mt-4 font-medium rounded-xl border transition-colors border-border-muted bg-surface-app text-text-default hover:bg-surface-elevated disabled:opacity-50 disabled:cursor-not-allowed">
                            {{ searchProfiles.isFetchingNextPage.value ? 'Loading...' : 'Load More' }}
                        </button>
                    </template>
                </div>
            </template>
        </div>
    </FeedViewLayout>
</template>
<script setup lang="ts">
    import { Bookmark, Flame, Search } from "lucide-vue-next";
    import { computed } from 'vue';
    import { useRouter } from "vue-router";
    import EmptyState from "../../../shared/components/empty/EmptyState.vue";
    import ErrorRetry from "../../../shared/components/error/ErrorRetry.vue";
    import PostSkeleton from "../../../shared/components/skeleton/PostSkeleton.vue";
    import ProfileSearchSkeleton from "../../../shared/components/skeleton/ProfileSearchSkeleton.vue";
    import { useLoginModal } from '../../../shared/composables/useLoginModal';
    import { useAuthStore } from '../../auth/store/authStore';
    import { useSearchProfiles } from "../../profile/composables";
    import FeedViewLayout from '../components/FeedViewLayout.vue';
    import { useSearchFeed, useSearchState } from "../composables";
    import { useFeedStore } from '../store/feedStore';
    import type { GetFeedWithCursorResponse, ToggleFavoriteParams, ToggleLikeParams } from "../types";

    const router = useRouter()
    const authStore = useAuthStore()
    const feedStore = useFeedStore()
    const { openModal } = useLoginModal()

    const tabs = [
        { id: 'top', label: 'Top' },
        { id: 'recent', label: 'Recent' },
        { id: 'profile', label: 'Profiles' }
    ] as const

    const {
        searchInput,
        searchQuery,
        activeFilter,
        hasSearched,
        setSearch,
        setFilter
    } = useSearchState()

    const feedSort = computed(() => activeFilter.value === 'profile' ? 'top' : activeFilter.value)
    const searchFeed = useSearchFeed(searchQuery, feedSort, {
        enabled: computed(() => activeFilter.value !== 'profile')
    })
    const feedResults = computed(() => {
        if (!searchFeed.data.value?.pages) return []
        return searchFeed.data.value.pages.flatMap((page: GetFeedWithCursorResponse) => page.data)
    })

    const searchProfiles = useSearchProfiles(searchQuery, activeFilter)
    const profileResults = computed(() => {
        if (!searchProfiles.data.value) return []
        return searchProfiles.data.value.pages.flatMap(page => page.users)
    })


    const handleTabClick = (tab: typeof tabs[number]) => {
        setFilter(tab.id)
    }

    const handleSearchQuery = () => {
        setSearch(searchInput.value)
    }


    const handleLoadMoreFeed = () => {
        if (searchFeed.isFetchingNextPage.value || !searchFeed.hasNextPage.value) return;
        searchFeed.fetchNextPage()
    }

    const handleTryAgainFeed = () => {
        if (searchFeed.isRefetching.value) return;
        searchFeed.refetch();
    }

    const handleLoadMoreProfile = () => {
        if (searchProfiles.isFetchingNextPage.value || !searchProfiles.hasNextPage.value) return;
        searchProfiles.fetchNextPage()
    }
    const handleTryAgainProfile = () => {
        if (searchProfiles.isRefetching.value) return;
        searchProfiles.refetch();
    }


    const formatDate = (date: Date | string): string => {
        const now = new Date();
        const postDate = new Date(date);
        const diffInMs = now.getTime() - postDate.getTime();
        const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));

        if (diffInHours < 1) {
            const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
            return diffInMinutes <= 1 ? 'just now' : `${diffInMinutes} minutes ago`;
        }

        if (diffInHours < 24) {
            return diffInHours === 1 ? '1 hour ago' : `${diffInHours} hours ago`;
        }

        const diffInDays = Math.floor(diffInHours / 24);
        if (diffInDays < 7) {
            return diffInDays === 1 ? '1 day ago' : `${diffInDays} days ago`;
        }
        return postDate.toLocaleDateString();
    };

    const handleToggleLike = ({ postId }: ToggleLikeParams) => {
        if (!authStore.hasAuthenticated) {
            openModal('like');
            return;
        }
        feedStore.toggleLike({ postId })
    }

    const handleToggleFavorite = ({ postId }: ToggleFavoriteParams) => {
        if (!authStore.hasAuthenticated) {
            openModal('favorite');
            return;
        }
        feedStore.toggleFavorite({ postId })
    }
</script>
<style scoped>
@keyframes fire-flare {
    0% {
        transform: scale(1);
    }

    50% {
        transform: scale(1.3);
    }

    100% {
        transform: scale(1);
    }
}

.like-button:active .like-icon {
    animation: fire-flare 400ms ease-out;
}

.favorite-button:active .favorite-icon {
    animation: fire-flare 400ms ease-out;
}
</style>