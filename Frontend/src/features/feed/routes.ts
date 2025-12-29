import type { RouteRecordRaw } from 'vue-router'
import { useLoginModal } from '../../shared/composables/useLoginModal'
import { useAuthStore } from '../auth/store/authStore'

export const feedRoutes: RouteRecordRaw[] = [
    {
        path: '/',
        component: () => import("../../app/layouts/FeedLayout.vue"),
        redirect: { name: 'feed' },
        children: [
            {
                path: '',
                name: 'feed',
                component: () => import("./views/Feed.vue"),
            },
            {
                path: 'search',
                name: 'search',
                component: () => import("./views/Search.vue"),
            },
            {
                path: 'create-post',
                name: 'create-post',
                component: () => import("./views/CreatePost.vue"),
                beforeEnter: (_, __, next) => {
                    const { openModal } = useLoginModal()
                    const authStore = useAuthStore()
                    if (!authStore.hasAuthenticated) {
                        openModal("create-post")
                        return next({ name: "feed" })
                    }
                    next()
                }
            },
            {
                path: 'settings',
                name: 'settings',
                component: () => import("./views/Settings.vue"),
                redirect: { name: 'settings-index' },
                children: [
                    {
                        path: '',
                        name: 'settings-index',
                        component: () => import("./views/SettingsIndex.vue"),
                    },
                    {
                        path: 'appearance',
                        name: 'settings-appearance',
                        component: () => import("./views/Appearance.vue"),
                    },
                ],
            },
        ],
    },
]
