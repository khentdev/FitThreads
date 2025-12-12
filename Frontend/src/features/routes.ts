import type { RouteRecordRaw } from 'vue-router'
import { authRoutes } from './auth/routes'
import { feedRoutes } from './feed/routes'
import { profileRoutes } from './profile/routes'

export const featureRoutes: RouteRecordRaw[] = [...authRoutes, ...feedRoutes, ...profileRoutes]
