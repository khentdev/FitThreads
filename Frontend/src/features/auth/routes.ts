import type { RouteRecordRaw } from 'vue-router'


export const authRoutes: RouteRecordRaw[] = [
    {
        path: '/auth',
        component: () => import("../../app/layouts/AuthLayout.vue"),
        redirect: { name: 'login' },
        meta: { authPages: true },
        children: [
            {
                path: 'login',
                name: 'login',
                meta: { authPages: true },
                component: () => import("../auth/views/LoginView.vue"),
            },
            {
                path: 'signup',
                name: 'signup',
                meta: { authPages: true },
                component: () => import("../auth/views/SignupView.vue"),
            },
            {
                path: 'magic-link',
                name: 'magic-link',
                meta: { authPages: true },
                component: () => import("../auth/views/MagicLinkView.vue"),
            },
            {
                path: 'verify',
                name: 'verify',
                meta: { authPages: true },
                component: () => import("../auth/views/VerifyOTP.vue"),
            },
            {
                path: 'forgot-password',
                name: 'forgot-password',
                meta: { authPages: true },
                component: () => import("../auth/views/SendResetPasswordLinkView.vue"),
            },
        ],
    },
]
