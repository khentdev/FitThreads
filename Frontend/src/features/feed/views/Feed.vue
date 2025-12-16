<template>
    <FeedViewLayout title="Feed">
        <PostSkeleton v-if="query.isPending.value" :count="5" />
        <ErrorRetry v-else-if="query.isError.value"
            message="Something went wrong. Please check your connection and try again."
            :is-retrying="query.isRefetching.value" :retryFn="handleTryAgain" />
        <EmptyState v-else-if="allPosts.length === 0" title="No posts yet"
            message="Be the first to share your fitness thoughts." />
        <div v-else class="flex flex-col px-0">
            <div v-for="post in allPosts" :key="post.id"
                class="p-5 rounded-xl rounded-b-none border-b border-border-muted bg-surface-app">
                <div class="flex gap-3 mb-3">
                    <div class="flex flex-col">
                        <span @click="router.push({ name: 'profile', params: { username: post.author.username } })"
                            class="font-bold text-[15px] text-text-default hover:underline hover:underline-offset-1 cursor-pointer active:text-text-muted transition-colors">@{{
                                post.author.username }}</span>
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

            <EmptyState v-if="!query.hasNextPage.value && allPosts.length > 0" title="You're all caught up!"
                message="That's all the posts for now. Check back later for more fitness thoughts."
                :show-icon="false" />
            <button v-if="query.hasNextPage.value" @click="handleLoadMore"
                :disabled="!query.hasNextPage.value || query.isFetchingNextPage.value"
                class="px-6 py-3 mx-4 mt-4 font-medium rounded-xl border transition-colors border-border-muted bg-surface-app text-text-default hover:bg-surface-elevated disabled:opacity-50 disabled:cursor-not-allowed">
                {{ query.isFetchingNextPage.value ? 'Loading...' : 'Load More' }}
            </button>
        </div>
    </FeedViewLayout>
</template>

<script setup lang="ts">
    import FeedViewLayout from '../components/FeedViewLayout.vue';
    import PostSkeleton from '../../../shared/components/skeleton/PostSkeleton.vue';
    import ErrorRetry from '../../../shared/components/error/ErrorRetry.vue';
    import EmptyState from '../../../shared/components/empty/EmptyState.vue';
    import { useRouter } from 'vue-router';
    import { Flame, Bookmark } from 'lucide-vue-next';
    import { computed } from 'vue';
    import { useMainFeed } from '../composables';
    import type { GetFeedWithCursorResponse } from '../types';

    const router = useRouter()
    const query = useMainFeed('recent');

    const allPosts = computed(() => {
        if (!query.data.value?.pages) return [];
        return query.data.value.pages.flatMap((page: GetFeedWithCursorResponse) => page.data)
    });

    const handleLoadMore = () => {
        if (query.isFetchingNextPage.value || !query.hasNextPage.value) return;
        query.fetchNextPage()
    }

    const handleTryAgain = () => {
        if (query.isRefetching.value) return;
        query.refetch();
    }

    const formatDate = (date: Date): string => {
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
