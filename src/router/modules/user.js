import DashboardLayout from '@/layouts/DashboardLayout.vue'
import DashboardView from '@/views/user/DashboardView.vue'
import ProfileView from '@/views/user/ProfileView.vue'
import SlideViewer from '@/components/wsi-viewer/SlideViewer.vue'


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
        path: '/wsi-viewer',
        name: 'SlideViewer',
        component: SlideViewer,
        meta: {
          requiresAuth: true 
        }
      }
    ]
  }
]

