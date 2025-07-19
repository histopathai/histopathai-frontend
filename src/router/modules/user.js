// src/router/modules/user.js - Fixed
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import DashboardView from '@/views/user/DashboardView.vue'
import ProfileView from '@/views/user/ProfileView.vue'
import ImageViewer from '@/components/user/ImageViewer.vue'
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
        path: '/wsi-viewer', // Bu yolu DashboardLayout'taki router-link'e uygun hale getirdik
        name: 'WSIViewer', // Yeni bir isim verilebilir veya ImageViewer kullanılabilir
        component: ImageViewer, // ImageViewer bileşenini bu yola bağla
        meta: {
          title: 'WSI Viewer',
          requiresAuth: true,
          requiresActive: true
        }
      }
    ]
  }
]
