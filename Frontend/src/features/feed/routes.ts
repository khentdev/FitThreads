import type { RouteRecordRaw } from 'vue-router'

export const feedRoutes: RouteRecordRaw[] = [
    {
        path: '/',
        component: () => import("../../app/layouts/FeedLayout.vue"),
        children: [
            {
                path: '',
                name: 'feed',
                component: () => import("../feed/views/FeedView.vue"),
            },
        ],
    },
]
