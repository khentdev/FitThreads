import type { RouteRecordRaw } from 'vue-router'

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
            },
            {
                path: 'settings',
                name: 'settings',
                component: () => import("./views/Settings.vue"),
            },
        ],
    },
]
