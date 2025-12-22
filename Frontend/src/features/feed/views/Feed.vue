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
    import { Bookmark, Flame } from 'lucide-vue-next';
    import { computed } from 'vue';
    import { useRouter } from 'vue-router';
    import EmptyState from '../../../shared/components/empty/EmptyState.vue';
    import ErrorRetry from '../../../shared/components/error/ErrorRetry.vue';
    import PostSkeleton from '../../../shared/components/skeleton/PostSkeleton.vue';

    import FeedViewLayout from '../components/FeedViewLayout.vue';
    import { useMainFeed } from '../composables';
    import { useFeedStore } from '../store/feedStore';
    import { useAuthStore } from '../../auth/store/authStore';
    import { useLoginModal } from '../../../shared/composables/useLoginModal';
    import type { GetFeedWithCursorResponse, ToggleLikeParams } from '../types';

    const router = useRouter()
    const query = useMainFeed('recent');
    const feedStore = useFeedStore()
    const authStore = useAuthStore()
    const { openModal } = useLoginModal()


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

    const handleToggleLike = ({ postId }: ToggleLikeParams) => {
        if (!authStore.hasAuthenticated) {
            openModal('like');
            return;
        }

        feedStore.toggleLike({ postId })
    }

    const handleToggleFavorite = ({ postId }: { postId: string }) => {
        if (!authStore.hasAuthenticated) {
            openModal('favorite');
            return;
        }
        // TODO: Implement favorite toggle when favorite fn (at feedStore) is ready
        console.log('Favorite toggle for post:', postId);
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