import AdminLayout from '@/layouts/AdminLayout.vue'
import AdminDashboard from '@/modules/admin/views/AdminDashboard.vue'
import UserManagementView from '@/modules/admin/views/UserManagementView.vue'


export default [
  {
    path: '/admin',
    component: AdminLayout,
    meta: { requiresAuth: true, requiresAdmin: true },
    children: [
      {
        path: '',
        name: 'AdminDashboard',
        component: AdminDashboard,
        meta: { title: 'Admin Dashboard' }
      },
      {
        path: 'users',
        name: 'UserManagement',
        component: UserManagementView,
        meta: { title: 'User Management' }
      }
    ]
  }
]
