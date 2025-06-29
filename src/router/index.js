import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

import authRoutes from './modules/auth'
import userRoutes from './modules/user'
import adminRoutes from './modules/admin'

import NotFoundView from '@/views/errors/NotFoundView.vue'

const LOGIN_PATH = '/auth/login'
const DASHBOARD_PATH = '/dashboard'
const ACCOUNT_STATUS_PATH = '/account-status'

const routes = [
  { path: '/', redirect: DASHBOARD_PATH },
  ...authRoutes,
  ...userRoutes,
  ...adminRoutes,
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: NotFoundView,
    meta: { title: 'Sayfa Bulunamadı' },
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior: () => ({ top: 0 }),
})

router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()

  if (!authStore.isAuthenticated && !authStore.loading) {
    await authStore.initializeAuth()
  }

  const user = authStore.user
  const isInactive =
    user?.status === 'pending' || user?.status === 'suspended' || user?.status === 'deactivated'

  const appName = import.meta.env.VITE_APP_NAME || 'Uygulama'
  document.title = to.meta.title ? `${to.meta.title} - ${appName}` : appName

  // 👇 Eğer kullanıcı giriş yaptıysa ama aktif değilse → account-status sayfasına yönlendir
  if (
    authStore.isAuthenticated &&
    isInactive &&
    to.path !== ACCOUNT_STATUS_PATH &&
    to.path !== LOGIN_PATH
  ) {
    return next(ACCOUNT_STATUS_PATH)
  }

  if (to.meta.requiresGuest) {
    if (authStore.isAuthenticated && !isInactive) {
      return next(DASHBOARD_PATH)
    }
    return next()
  }

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    return next(LOGIN_PATH)
  }

  if (to.meta.requiresAdmin && authStore.user?.role !== 'admin') {
    return next(DASHBOARD_PATH)
  }

  next()
})

export default router
