<template>
    <FeedViewLayout title="Create Post">
        <div class="flex flex-col flex-1 w-full min-h-0 md:px-0">
            <div class="flex overflow-hidden flex-col flex-1 p-4 md:rounded-xl border-none bg-surface-app">
                <div class="flex-none mb-4">
                    <input v-model="title" type="text" placeholder="Title your thought..." @input="onTitleInput"
                        id="titleInput"
                        class="pl-0 w-full h-10 text-2xl font-bold bg-transparent border-l-2 border-transparent transition-all duration-200 outline-none md:h-12 md:text-3xl text-text-default placeholder:text-text-muted/30 focus:border-solid-primary focus:pl-3 focus:placeholder:text-text-muted/50"
                        maxlength="100" />
                </div>
                <div class="flex flex-col flex-1 mb-4 min-h-0">
                    <textarea v-model="content" placeholder="Share something authentic. No fluff, just fitness."
                        id="contentInput" @input="onContentInput"
                        class="flex-1 pl-0 w-full text-base leading-relaxed bg-transparent border-l-2 border-transparent transition-all duration-200 outline-none resize-none md:text-lg text-text-default placeholder:text-text-muted/30 focus:border-solid-primary focus:pl-3 focus:placeholder:text-text-muted/50"></textarea>
                </div>
                <div class="flex-none pt-4 border-t border-border-muted/30">
                    <div class="flex items-center mb-4 text-xs font-medium text-text-muted/60">
                        {{ content.length }} / 500 chars
                    </div>
                    <div class="space-y-4">
                        <div class="relative group">
                            <div :class="[tags.length >= 5 ? 'bg-surface-elevated/50 cursor-not-allowed opacity-60' : '']"
                                class="flex gap-2 items-center p-3 rounded-xl border transition-all duration-200 focus-within:bg-transparent border-border-muted focus-within:border-solid-primary focus-within:ring-1 focus-within:ring-solid-primary/20">

                                <Hash
                                    class="transition-colors size-4 text-text-muted group-focus-within:text-solid-primary" />
                                <input v-model="tagInput" @keydown.enter.prevent="addTag" type="text" id="tagInput"
                                    placeholder="Tags (max 5)..."
                                    class="flex-1 p-0 text-sm bg-transparent border-none outline-none text-text-default placeholder:text-text-muted/50 focus:ring-0"
                                    :disabled="tags.length >= 5" />
                                <span class="text-xs font-medium text-text-muted/50">
                                    {{ tags.length }}/5
                                </span>
                            </div>
                        </div>

                        <div v-if="tags.length > 0" class="flex flex-wrap gap-2 duration-200 break-all">
                            <span v-for="tag in tags" :key="tag"
                                class="inline-flex items-center py-1.5 pr-2 text-wrap pl-3 text-xs font-medium rounded-full bg-surface-elevated text-text-muted">
                                #{{ tag }}
                                <button @click="removeTag(tag)"
                                    class="p-0.5 ml-2 rounded-full cursor-pointer text-text-muted">
                                    <X class="size-3" />
                                </button>
                            </span>
                        </div>

                        <div class="flex justify-end items-center pt-2">
                            <button @click="handleCreatePost"
                                :class="[feedStore.states.creatingPost ? 'opacity-50 cursor-not-allowed animate-pulse' : '']"
                                class="flex items-center gap-2 py-2 px-6 bg-solid-primary hover:bg-solid-hover disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl shadow-sm shadow-solid-primary/20 transition-all active:scale-[0.98]">
                                <template v-if="feedStore.states.creatingPost">
                                    <div class="flex items-center gap-2">
                                        <Loader2 class="size-4 animate-spin" />
                                        <span>Posting...</span>
                                    </div>
                                </template>
                                <template v-else>
                                    <span>Post</span>
                                    <Send class="size-4" />
                                </template>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            <p class="mt-4 text-xs text-center text-text-muted/50">
                Share authentic thoughts. Inspire others.
            </p>
        </div>
    </FeedViewLayout>
</template>

<script setup lang="ts">
    import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
    import { X, Hash, Send, Loader2 } from 'lucide-vue-next';
    import FeedViewLayout from '../components/FeedViewLayout.vue';
    import { useFeedStore } from '../store/feedStore';
    import { onBeforeRouteLeave } from 'vue-router';

    const feedStore = useFeedStore()

    const title = ref('');
    const content = ref('');
    const tagInput = ref('');
    const tags = ref<string[]>([]);
    const hasUnsavedChanges = computed(() => title.value.trim() !== '' || content.value.trim() !== '' || tags.value.length > 0)

    const onTitleInput = (event: Event) => {
        title.value = (event.target as HTMLInputElement).value
            .replace(/\s+/g, ' ')
            .slice(0, 100)
    }

    const onContentInput = (event: Event) => {
        content.value = (event.target as HTMLInputElement).value
            .replace(/ {2,}/g, ' ')
            .slice(0, 500)
    }

    const addTag = () => {
        let raw = tagInput.value.trim()
        if (raw.length <= 0) return
        if (raw.startsWith("#")) raw = raw.slice(1)

        let cleanedInput = raw.replace(/[^a-zA-Z0-9_-]/g, "")
        cleanedInput = cleanedInput.slice(0, 30)
        if (!cleanedInput) return
        if (tags.value.length >= 5) return
        if (tags.value.includes(cleanedInput)) return
        tags.value.push(cleanedInput)
        tagInput.value = ''
    }

    const removeTag = (tag: string) => {
        tags.value = tags.value.filter((t) => t !== tag)
    }

    const handleCreatePost = async () => {
        const snapshot = {
            title: title.value,
            content: content.value,
            tags: [...tags.value],
            tagInput: tagInput.value
        }
        try {
            const { success } = await feedStore.createPost({ title: title.value, content: content.value, postTags: tags.value })
            if (!success) throw new Error()
            title.value = ''
            content.value = ''
            tags.value = []
            tagInput.value = ''
        } catch {
            title.value = snapshot.title
            content.value = snapshot.content
            tags.value = [...snapshot.tags]
            tagInput.value = snapshot.tagInput
        }
    }

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
        if (hasUnsavedChanges.value) {
            e.preventDefault()
        }
    }
    onMounted(() => {
        window.addEventListener('beforeunload', handleBeforeUnload)
    })
    onBeforeUnmount(() => {
        window.removeEventListener("beforeunload", handleBeforeUnload)
    })

    onBeforeRouteLeave((_, __, next) => {
        if (!hasUnsavedChanges.value) return next()
        const answer = window.confirm('You have unsaved changes. Are you sure you want to leave?')
        if (answer) return next()
        next(false)
    })
</script>