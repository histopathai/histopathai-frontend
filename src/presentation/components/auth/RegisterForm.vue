<template>
  <div>
    <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">Yeni Hesap Oluştur</h2>
    <p class="mt-2 text-center text-sm text-gray-600">
      Ya da
      <router-link to="/auth/login" class="font-medium text-primary-600 hover:text-primary-500">
        hesabına giriş yap
      </router-link>
    </p>

    <form class="mt-8 space-y-6" @submit.prevent="handleRegister">
      <!-- E-posta -->
      <div>
        <label for="email" class="form-label">E-posta Adresi</label>
        <input
          id="email"
          type="email"
          v-model.trim="email"
          class="form-input"
          required
          :class="{ 'border-red-500': emailError }"
        />
        <p v-if="emailError" class="mt-2 text-sm text-red-600">{{ emailError }}</p>
      </div>

      <!-- Görünen Ad -->
      <div>
        <label for="displayName" class="form-label">Görünen Ad (isteğe bağlı)</label>
        <input id="displayName" type="text" v-model.trim="displayName" class="form-input" />
      </div>

      <!-- Şifre -->
      <div>
        <label for="password" class="form-label">Şifre</label>
        <input
          id="password"
          type="password"
          v-model="password"
          class="form-input"
          required
          autocomplete="new-password"
          :class="{ 'border-red-500': passwordError }"
        />
        <p v-if="passwordError" class="mt-2 text-sm text-red-600">{{ passwordError }}</p>
      </div>

      <!-- Şifre Tekrar -->
      <div>
        <label for="confirmPassword" class="form-label">Şifre Tekrar</label>
        <input
          id="confirmPassword"
          type="password"
          v-model="confirmPassword"
          class="form-input"
          required
          autocomplete="new-password"
          :class="{ 'border-red-500': confirmPasswordError }"
        />
        <p v-if="confirmPasswordError" class="mt-2 text-sm text-red-600">
          {{ confirmPasswordError }}
        </p>
      </div>

      <!-- Buton -->
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
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2
                5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824
                3 7.938l3-2.647z"
            />
          </svg>
          Kaydol
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, inject } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/application/state/auth.store.js'
import { useToast } from 'vue-toastification'

const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const displayName = ref('')

const emailError = ref(null)
const passwordError = ref(null)
const confirmPasswordError = ref(null)

const authStore = useAuthStore()
const router = useRouter()
const toast = useToast()
const authService = inject('authService')

const validateForm = () => {
  emailError.value = null
  passwordError.value = null
  confirmPasswordError.value = null

  let valid = true

  if (!email.value) {
    emailError.value = 'E-posta adresi gerekli.'
    valid = false
  } else if (!/\S+@\S+\.\S+/.test(email.value)) {
    emailError.value = 'Geçerli bir e-posta adresi girin.'
    valid = false
  }

  if (!password.value) {
    passwordError.value = 'Şifre gerekli.'
    valid = false
  } else if (password.value.length < 8) {
    passwordError.value = 'Şifre en az 8 karakter olmalı.'
    valid = false
  }

  if (password.value !== confirmPassword.value) {
    confirmPasswordError.value = 'Şifreler eşleşmiyor.'
    valid = false
  }

  return valid
}

const handleRegister = async () => {
  if (!validateForm()) return;
  const payload = {
    email: email.value,
    password: password.value,
    displayName: displayName.value || undefined,
  };

  const result = await authService.handleRegistration(payload);

  if (result.success) {
    toast.success(result.message || 'Kayıt başarılı! Yönetici onayı bekleniyor.');
    router.push('/auth/login');
  } else {
    toast.error(result.message || 'Kayıt başarısız.');
  }

};
</script>
