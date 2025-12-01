import type { RouteRecordRaw } from 'vue-router'


export const authRoutes: RouteRecordRaw[] = [
    {
        path: '/auth',
        component: () => import("../../app/layouts/AuthLayout.vue"),
        children: [
            {
                path: 'login',
                name: 'login',
                component: () => import("../auth/views/LoginView.vue"),
            },
            {
                path: 'signup',
                name: 'signup',
                component: () => import("../auth/views/SignupView.vue"),
            },
            {
                path: 'magic-link',
                name: 'magic-link',
                component: () => import("../auth/views/MagicLinkView.vue"),
            },
            {
                path: 'verify',
                name: 'verify',
                component: () => import("../auth/views/VerifyOTP.vue"),
            },
        ],
    },
]
