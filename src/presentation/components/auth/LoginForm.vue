<template>
  <div>
    <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">Hesabına Giriş Yap</h2>
    <p class="mt-2 text-center text-sm text-gray-600">
      Ya da
      <router-link to="/auth/register" class="font-medium text-primary-600 hover:text-primary-500">
        yeni hesap oluştur
      </router-link>
    </p>

    <form class="mt-8 space-y-6" @submit.prevent="handleLogin">
      <!-- E-posta -->
      <div>
        <label for="email" class="form-label">E-posta Adresi</label>
        <input
          id="email"
          type="email"
          v-model.trim="email"
          required
          class="form-input"
          :class="{ 'border-red-500': emailError }"
        />
        <p v-if="emailError" class="mt-2 text-sm text-red-600">{{ emailError }}</p>
      </div>

      <!-- Şifre -->
      <div>
        <label for="password" class="form-label">Şifre</label>
        <input
          id="password"
          type="password"
          v-model="password"
          required
          class="form-input"
          :class="{ 'border-red-500': passwordError }"
        />
        <p v-if="passwordError" class="mt-2 text-sm text-red-600">{{ passwordError }}</p>
      </div>

      <!-- Şifremi Unuttum -->
      <div class="flex justify-end text-sm">
        <router-link
          to="/auth/password-reset"
          class="font-medium text-primary-600 hover:text-primary-500"
        >
          Şifreni mi unuttun?
        </router-link>
      </div>

      <!-- Giriş Butonu -->
      <div>
        <button type="submit" class="btn btn-primary w-full" :disabled="authStore.loading">
          <svg
            v-if="authStore.loading"
            class="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              class="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              stroke-width="4"
            />
            <path
              class="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291
              A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          Giriş Yap
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, inject } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/application/state/auth.store.js';
import { useToast } from 'vue-toastification'


const authStore = useAuthStore()
const router = useRouter()
const toast = useToast()

const authService = inject('authService')

const email = ref('')
const password = ref('')
const emailError = ref(null)
const passwordError = ref(null)

const validateForm = () => {
  emailError.value = null
  passwordError.value = null

  let isValid = true

  if (!email.value) {
    emailError.value = 'E-posta adresi gerekli.'
    isValid = false
  } else if (!/\S+@\S+\.\S+/.test(email.value)) {
    emailError.value = 'Geçerli bir e-posta adresi girin.'
    isValid = false
  }

  if (!password.value) {
    passwordError.value = 'Şifre gerekli.'
    isValid = false
  }

  return isValid
}

const handleLogin = async () => {
  if (!validateForm()) return;
  const result = await authService.handleLogin(email.value, password.value);

  if (result.success) {
    toast.success('Giriş başarılı!');
    router.push('/dashboard');
  } else {
    toast.error(result.message || 'Giriş başarısız oldu.');
  }
};
</script>
