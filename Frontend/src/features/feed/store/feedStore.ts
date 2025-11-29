import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Post } from '../types'

export const useFeedStore = defineStore('feed', () => {
    const posts = ref<Post[]>([])
    const isLoadingPosts = ref<boolean>(false)

    const setPosts = (newPosts: Post[]): void => {
        posts.value = newPosts
    }

    const addPost = (post: Post): void => {
        posts.value.unshift(post)
    }

    const setLoading = (value: boolean): void => {
        isLoadingPosts.value = value
    }

    return {
        posts,
        isLoadingPosts,
        setPosts,
        addPost,
        setLoading,
    }
})
