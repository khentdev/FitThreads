<template>
    <FeedViewLayout title="Feed">
        <div class="flex flex-col gap-4 px-4 md:px-0">
            <div v-for="i in 10" :key="i" class="p-5 rounded-xl border border-border-muted bg-surface-app">
                <div class="flex gap-3 mb-3">
                    <div class="flex flex-col">
                        <span class="font-bold text-[15px] text-text-default">@username_{{ i }}</span>
                        <span class="text-xs text-text-muted">about {{ i }} hours ago</span>
                    </div>
                </div>
                <div class="mb-4">
                    <p class="text-[15px] leading-relaxed text-text-default wrap-break-word">
                        Hit a new PR today! 405lbs deadlift. Consistency pays off. Remember: progressive overload
                        isn't just about adding weight - it's about showing up every single day. Hit a new PR today!
                        405lbs deadlift. Consistency pay Hit a new PR today! 405lbs deadlift. Consistency pays off.
                        Remember: progressive overload
                        isn't just about adding weight - it's about showing up every single day.s off. Remember:
                        progressive overload
                        isn't just about adding weight - it's about showing up every single day.p every single day.
                    </p>
                </div>

                <div class="flex flex-wrap gap-2 mb-4">
                    <span
                        class="px-3 py-1 text-xs font-medium rounded-full bg-surface-elevated text-text-muted">#strength</span>
                    <span
                        class="px-3 py-1 text-xs font-medium rounded-full bg-surface-elevated text-text-muted">#powerlifting</span>
                    <span
                        class="px-3 py-1 text-xs font-medium rounded-full bg-surface-elevated text-text-muted">#motivation</span>
                </div>

                <div class="flex gap-6">
                    <div
                        class="flex gap-2 items-center transition-colors cursor-pointer text-text-muted hover:text-orange-500 group">
                        <Flame class="w-5 h-5 group-hover:fill-orange-500/20" />
                        <span class="text-sm font-medium">142</span>
                    </div>
                    <div
                        class="flex gap-2 items-center transition-colors cursor-pointer text-text-muted hover:text-blue-500 group">
                        <Bookmark class="w-5 h-5 group-hover:fill-blue-500/20" />
                        <span class="text-sm font-medium">38</span>
                    </div>
                </div>
            </div>
        </div>
    </FeedViewLayout>
</template>

<script setup lang="ts">
    import FeedViewLayout from '../components/FeedViewLayout.vue';
    import { Flame, Bookmark } from 'lucide-vue-next';
</script>
