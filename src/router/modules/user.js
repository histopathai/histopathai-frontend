// src/router/modules/user.js
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import DashboardView from '@/modules/user/views/DashboardView.vue'
import ProfileView from '@/modules/user/views/ProfileView.vue'
import ImageViewer from '@/modules/viewer/components/ImageViewer.vue'
import WorkspaceView from '@/modules/workspace/views/WorkspaceView.vue' // Yeni import

export default [
  {
    path: '/dashboard',
    component: DashboardLayout,
    meta: { requiresAuth: true, requiresActive: true },
    children: [
      {
        path: '',
        name: 'Dashboard',
        component: DashboardView,
        meta: { title: 'Dashboard' }
      },
      {
        path: 'profile',
        name: 'Profile',
        component: ProfileView,
        meta: { title: 'Profile' }
      },
      {
        // Yeni Çalışma Alanı rotası
        path: 'workspaces',
        name: 'Workspaces',
        component: WorkspaceView,
        meta: { title: 'My Workspaces' }
      },
      {
        path: '/wsi-viewer',
        name: 'WSIViewer',
        component: ImageViewer,
        meta: {
          title: 'WSI Viewer',
          requiresAuth: true,
          requiresActive: true
        }
      }
    ]
  }
]
