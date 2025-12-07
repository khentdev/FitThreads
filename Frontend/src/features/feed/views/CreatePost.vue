<template>
    <FeedViewLayout title="Create Post">
        <div class="w-full flex-1 flex flex-col min-h-0 px-4 md:px-0">
            <div class="flex-1 flex flex-col rounded-xl border border-border-muted bg-surface-app p-4 overflow-hidden">
                <div class="flex-none mb-4">
                    <input v-model="title" type="text" placeholder="Title your thought..."
                        class="w-full bg-transparent h-10 md:h-12 text-2xl md:text-3xl font-bold text-text-default placeholder:text-text-muted/30 outline-none border-l-2 border-transparent focus:border-solid-primary pl-0 focus:pl-3 transition-all duration-200 focus:placeholder:text-text-muted/50"
                        maxlength="100" />
                </div>

                <div class="flex-1 flex flex-col min-h-0 mb-4">
                    <textarea v-model="content" placeholder="Share something authentic. No fluff, just fitness."
                        class="w-full flex-1 text-base md:text-lg leading-relaxed text-text-default placeholder:text-text-muted/30 resize-none outline-none bg-transparent border-l-2 border-transparent focus:border-solid-primary pl-0 focus:pl-3 transition-all duration-200 focus:placeholder:text-text-muted/50"
                        maxlength="2000"></textarea>
                </div>
                <div class="flex-none pt-4 border-t border-border-muted/30">
                    <div class="space-y-4">
                        <div class="relative group">
                            <div
                                class="flex items-center gap-2 p-3 rounded-xl bg-surface-elevated focus-within:bg-transparent border border-border-muted/50 focus-within:border-solid-primary focus-within:ring-1 focus-within:ring-solid-primary/20 transition-all duration-200">
                                <Hash
                                    class="w-4 h-4 text-text-muted group-focus-within:text-solid-primary transition-colors" />
                                <input v-model="tagInput" @keydown.enter.prevent="addTag"
                                    @keydown.space.prevent="addTag" type="text" placeholder="Tags (max 5)..."
                                    class="flex-1 bg-transparent text-sm text-text-default placeholder:text-text-muted/50 outline-none border-none p-0 focus:ring-0"
                                    :disabled="tags.length >= 5" />
                                <span class="text-xs font-medium text-text-muted/50">
                                    {{ tags.length }}/5
                                </span>
                            </div>
                        </div>

                        <div v-if="tags.length > 0" class="flex flex-wrap gap-2 duration-200">
                            <span v-for="tag in tags" :key="tag"
                                class="inline-flex items-center pl-3 pr-2 py-1 text-xs font-medium rounded-full bg-surface-elevated text-text-muted">
                                #{{ tag }}
                                <button @click="removeTag(tag)"
                                    class="ml-2 p-0.5 rounded-full text-text-muted cursor-pointer">
                                    <X class="w-3 h-3" />
                                </button>
                            </span>
                        </div>

                        <div class="flex items-center justify-between pt-2">
                            <div class="flex items-center gap-4 text-xs font-medium text-text-muted/60">
                                <span :class="{ 'text-solid-primary': content.length > 1800 }">
                                    {{ content.length }} chars
                                </span>
                            </div>

                            <button @click="submitPost" :disabled="!isValid || isSubmitting"
                                class="flex items-center gap-2 py-2 px-6 bg-solid-primary hover:bg-solid-hover disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl shadow-sm shadow-solid-primary/20 transition-all active:scale-[0.98]">
                                <span v-if="isSubmitting">Posting...</span>
                                <span v-else>Post</span>
                                <Send v-if="!isSubmitting" class="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            <p class="text-center text-xs text-text-muted/50 mt-4">
                Share authentic thoughts. Inspire others.
            </p>
        </div>
    </FeedViewLayout>
</template>

<script setup lang="ts">
    import { ref, computed } from 'vue';
    import { X, Hash, Send } from 'lucide-vue-next';
    import FeedViewLayout from '../components/FeedViewLayout.vue';

    const emit = defineEmits<{
        (e: 'post', data: { title: string; content: string; tags: string[] }): void;
    }>();

    const title = ref('');
    const content = ref('');
    const tagInput = ref('');
    const tags = ref<string[]>([]);
    const isSubmitting = ref(false);

    const isValid = computed(() => {
        return title.value.trim().length > 0 && content.value.trim().length > 0;
    });

    function addTag() {
        const rawTag = tagInput.value.trim();
        if (!rawTag) return;

        // Remove # if present and clean up
        const cleanTag = rawTag.replace(/^#/, '').trim().toLowerCase();

        if (cleanTag && !tags.value.includes(cleanTag) && tags.value.length < 5) {
            tags.value.push(cleanTag);
        }

        tagInput.value = '';
    }

    function removeTag(tagToRemove: string) {
        tags.value = tags.value.filter(tag => tag !== tagToRemove);
    }

    async function submitPost() {
        if (!isValid.value || isSubmitting.value) return;

        isSubmitting.value = true;
        try {
            emit('post', {
                title: title.value,
                content: content.value,
                tags: tags.value
            });
            // Reset form
            title.value = '';
            content.value = '';
            tags.value = [];
        } finally {
            isSubmitting.value = false;
        }
    }
</script>