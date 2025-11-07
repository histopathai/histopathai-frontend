import { createApp } from 'vue'
import { createPinia } from 'pinia'
import Toast from 'vue-toastification' // Toast bildirimleri için
import router from '@/application/router'
import App from './App.vue'
import { initializeApp } from 'firebase/app' // Firebase uygulaması için
import { getAuth } from 'firebase/auth'
// Import CSS
import './assets/css/main.css'
import 'vue-toastification/dist/index.css'

import { AuthRepositoryImpl } from '@/infrastructure/repositories/AuthRepository.impl.js';
import { RegisterUserUseCase } from '@/core/use-cases/auth/RegisterUser.usecase.js';
import { VerifyTokenUseCase } from '@/core/use-cases/auth/VerifyToken.usecase.js';
import { AuthService } from '@/application/services/AuthService.js';
import { useAuthStore } from '@/application/state/auth.store.js';
import { GetUserProfileUseCase } from '@/core/use-cases/auth/GetUserProfile.usecase.js';

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

const authRepository = new AuthRepositoryImpl();
const registerUserUseCase = new RegisterUserUseCase(authRepository);
const verifyTokenUseCase = new VerifyTokenUseCase(authRepository);
const getUserProfileUseCase = new GetUserProfileUseCase(authRepository); // <-- YENİ
const authService = new AuthService(
  registerUserUseCase,
  verifyTokenUseCase,
  authRepository,
  getUserProfileUseCase
);
app.provide('authService', authService);

const authStore = useAuthStore(pinia)
authStore.initializeAuth()

app.mount('#app')
