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

                <div class="mt-4 flex flex-col" v-if="(activeFilter === 'top' || activeFilter === 'recent')">
                    <PostSkeleton v-if="searchFeed.isLoading.value" />
                    <ErrorRetry v-else-if="searchFeed.isError.value"
                        message="Something went wrong. Please check your connection and try again."
                        :is-retrying="searchFeed.isRefetching.value" :retryFn="handleTryAgain" />
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
                            <div
                                class="flex gap-2 items-center transition-colors cursor-pointer text-text-muted hover:text-orange-500 group">
                                <Flame class="w-5 h-5 group-hover:fill-orange-500/20" />
                                <span class="text-sm font-medium">{{ post._count.likes }}</span>
                            </div>
                            <div
                                class="flex gap-2 items-center transition-colors cursor-pointer text-text-muted hover:text-blue-500 group">
                                <Bookmark class="w-5 h-5 group-hover:fill-blue-500/20" />
                                <span class="text-sm font-medium">{{ post._count.favorites }}</span>
                            </div>
                        </div>
                    </div>
                    <EmptyState v-if="!searchFeed.hasNextPage.value && feedResults.length > 0"
                        title="You're all caught up!"
                        message="That's all the posts for now. Check back later for more fitness thoughts."
                        :show-icon="false" />
                    <button v-if="searchFeed.hasNextPage.value" @click="handleLoadMore"
                        :disabled="!searchFeed.hasNextPage.value || searchFeed.isFetchingNextPage.value"
                        class="px-6 py-3 mx-4 mt-4 font-medium rounded-xl border transition-colors border-border-muted bg-surface-app text-text-default hover:bg-surface-elevated disabled:opacity-50 disabled:cursor-not-allowed">
                        {{ searchFeed.isFetchingNextPage.value ? 'Loading...' : 'Load More' }}
                    </button>
                </div>

                <!-- <div class="mt-4" v-if="activeFilter === 'profile'">
                    <div v-if="searchProfiles.isLoading.value" class="flex flex-col">
                        <PostSkeleton />
                    </div>
                    <EmptyState v-else-if="profileResults.length === 0" title="No profiles found"
                        message="Try searching for a different username." />
                    <div v-else class="flex flex-col px-0">
                        <div v-for="profile in profileResults" :key="profile.username"
                            @click="() => router.push({ name: 'profile', params: { username: profile.username } })"
                            class="p-5 rounded-xl rounded-b-none border-b border-border-muted bg-surface-app cursor-pointer transition-colors hover:bg-surface-elevated">
                            <div class="flex justify-between items-start">
                                <div class="flex flex-col gap-1">
                                    <span class="font-bold text-[15px] text-text-default">
                                        @{{ profile.username }}
                                    </span>
                                    <p v-if="profile.bio" class="text-sm text-text-muted line-clamp-2 leading-relaxed">
                                        {{ profile.bio }}
                                    </p>
                                    <p v-else class="text-sm text-text-muted italic">
                                        No bio available
                                    </p>
                                </div>
                            </div>

                            <div class="flex gap-4 mt-4 pt-4 border-t border-border-muted/50">
                                <div class="flex gap-2 items-center text-text-muted">
                                    <Flame class="w-4 h-4 fill-orange-500/10 text-orange-500" />
                                    <span class="text-xs font-medium">{{ profile.totalLikes }} likes</span>
                                </div>
                                <div class="flex gap-2 items-center text-text-muted">
                                    <span class="text-xs">Joined {{ formatDate(profile.joinedAt) }}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div> -->
            </template>
        </div>
    </FeedViewLayout>
</template>
<script setup lang="ts">
    import { Search, Flame, Bookmark } from "lucide-vue-next"
    import PostSkeleton from "../../../shared/components/skeleton/PostSkeleton.vue";
    import FeedViewLayout from '../components/FeedViewLayout.vue';
    import ErrorRetry from "../../../shared/components/error/ErrorRetry.vue";
    import { useSearchFeed, useSearchState } from "../composables";
    import { computed } from 'vue';
    import type { GetFeedWithCursorResponse } from "../types";
    import EmptyState from "../../../shared/components/empty/EmptyState.vue";
    import { useSearchProfiles } from "../../profile/composables";
    import { useRouter } from "vue-router";

    const router = useRouter()

    const tabs = [
        { id: 'top', label: 'Top' },
        { id: 'recent', label: 'Recent' },
        { id: 'profile', label: 'Profile' }
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

    // const profileFilter = computed(() => activeFilter.value === 'profile' ? 'profile' : 'top')
    // const searchProfiles = useSearchProfiles(searchQuery, profileFilter)
    // const profileResults = computed(() => {
    //     if (!searchProfiles.data.value) return []
    //     return searchProfiles.data.value
    // })

    const handleTabClick = (tab: typeof tabs[number]) => {
        setFilter(tab.id)
    }

    const handleSearchQuery = () => {
        setSearch(searchInput.value)
    }

    const handleLoadMore = () => {
        if (searchFeed.isFetchingNextPage.value || !searchFeed.hasNextPage.value) return;
        searchFeed.fetchNextPage()
    }
    const handleTryAgain = () => {
        if (searchFeed.isRefetching.value) return;
        searchFeed.refetch();
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
</script>
