import type { RouteRecordRaw } from "vue-router";

export const profileRoutes: RouteRecordRaw[] = [
    {
        path: '/@:username',
        component: () => import("../../app/layouts/FeedLayout.vue"),
        children: [
            {
                path: '',
                component: () => import("./views/Profile.vue"),
                name: 'profile',
                redirect: { name: 'profile-thoughts' },
                children: [
                    {
                        path: '',
                        name: 'profile-thoughts',
                        component: () => import("./views/ProfileThoughts.vue"),
                    },
                    {
                        path: 'favorites',
                        name: 'profile-favorites',
                        component: () => import("./views/ProfileFavorites.vue"),
                    }
                ]
            },
        ],
    },

]

