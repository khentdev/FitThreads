import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import { featureRoutes } from '../../features/routes'
import NotFoundView from '../../views/NotFoundView.vue'
import { useAuthStore } from '../../features/auth/store/authStore'


const routes: RouteRecordRaw[] = [
    ...featureRoutes,
    {
        path: '/:pathMatch(.*)*',
        name: 'not-found',
        component: NotFoundView,
    },
]

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes,
})

router.beforeEach(async (to, from, next) => {
    const isDev = import.meta.env.DEV
    if (isDev) console.log("🚀 Guard entry:", {
        original: to.fullPath,
        toName: to.name,
        toPath: to.path,
        fromName: from.name,
    });

    const authStore = useAuthStore()
    if (authStore.hasAuthenticated) return next()

    const isAuthPages = to.matched.some(r => r.meta['authPages'])
    if (isAuthPages) return next()

    if (!authStore.states.sessionInitialized)
        await authStore.refreshSession()

    return next()
})



export default router
