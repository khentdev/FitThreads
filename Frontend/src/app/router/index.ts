import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import { featureRoutes } from '../../features/routes'
import NotFoundView from '../../views/NotFoundView.vue'

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

export default router
