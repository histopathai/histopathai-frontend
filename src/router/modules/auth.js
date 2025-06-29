import AuthLayout from '@/layouts/AuthLayout.vue'
import LoginView from '@/views/auth/LoginView.vue'
import RegisterView from '@/views/auth/RegisterView.vue'
import AccountStatusView from '@/views/auth/AccountStatusView.vue'

export default [
  {
    path: '/auth',
    component: AuthLayout,
    meta: { requiresGuest: true },
    children: [
      { path: '', redirect: '/auth/login' },
      {
        path: 'login',
        name: 'Login',
        component: LoginView,
        meta: { title: 'Login' },
      },
      {
        path: 'register',
        name: 'Register',
        component: RegisterView,
        meta: { title: 'Register' },
      },
    ],
  },
  {
    path: '/account-status',
    name: 'AccountStatus',
    component: AccountStatusView,
    meta: { requiresAuth: true, title: 'Hesap Durumu' },
  },
]
