import type { RouteRecordRaw } from 'vue-router'
import { authRoutes } from './auth/routes'
import { feedRoutes } from './feed/routes'

export const featureRoutes: RouteRecordRaw[] = [...authRoutes, ...feedRoutes]
