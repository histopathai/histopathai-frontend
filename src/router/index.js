import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

//Route modules
import authRoutes from './modules/auth'
import userRoutes from './modules/user'
import adminRoutes from './modules/admin'

import NotFoundView from '@/views/errors/NotFoundView.vue'

const routes = [
  {
    path: '/',
    redirect: '/dashboard',
  },
  ...authRoutes,
  ...userRoutes,
  ...adminRoutes,
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: NotFoundView,
    meta: { title: 'Page Not Found' },
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,

  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  },
})

// Global navigation guard
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()

  if (!authStore.isAuthenticated && !authStore.loading) {
    await authStore.initializeAuth() // ÖNEMLİ: initializeAuth() işleminin tamamlanmasını BEKLE
  }

  const appName = import.meta.env.VITE_APP_NAME || 'HistopathAI'
  document.title = to.meta.title ? `${to.meta.title} - ${appName}` : appName

  // 1. Guest routes control
  if (to.meta.requiresGuest) {
    if (authStore.isAuthenticated) {
      return next('/dashboard')
    }
    return next()
  }

  // 2. authenticated routes control
  if (to.meta.requiresAuth) {
    if (!authStore.isAuthenticated) {
      return next('/auth/login')
    }

    // 3. active status routes control
    if (to.meta.requiresActive && !authStore.isActive) {
      if (to.path !== '/dashboard') {
        return next('/dashboard')
      }
    }

    // 4. admin routes control
    if (to.meta.requiresAdmin && !authStore.isAdmin) {
      return next('/dashboard')
    }
  }

  // 5. if all checks passed, proceed to the route
  next()
})

export default router
