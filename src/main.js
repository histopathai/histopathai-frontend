import { createApp } from 'vue'
import { createPinia } from 'pinia'
import Toast from 'vue-toastification' // Toast bildirimleri için
import router from './router'
import App from './App.vue'
import { initializeApp } from 'firebase/app' // Firebase uygulaması için
import { getAuth } from 'firebase/auth'
// Import CSS
import './assets/css/main.css'
import 'vue-toastification/dist/index.css'

import { useAuthStore } from './stores/auth'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
}

const firebaseApp = initializeApp(firebaseConfig)
export const auth = getAuth(firebaseApp)

const toastOptions = {
  position: 'top-right',
  timeout: 5000,
  closeOnClick: true,
  pauseOnFocusLoss: true,
  pauseOnHover: true,
  draggable: true,
  draggablePercent: 0.6,
  showCloseButtonOnHover: false,
  hideProgressBar: false,
  closeButton: 'button',
  icon: true,
  rtl: false,
  transition: 'Vue-Toastification__bounce',
  maxToasts: 20,
  newestOnTop: true,
}

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)
app.use(Toast, toastOptions)

const authStore = useAuthStore(pinia)
authStore.initializeAuth()
console.log('Vue uygulaması başlatılıyor ve DOMa bağlanıyor!') // <-- Bu satırı ekle

app.mount('#app')
