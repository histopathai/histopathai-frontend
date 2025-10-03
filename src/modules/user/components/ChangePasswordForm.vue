<template>
  <div class="card mt-6">
    <div class="card-header">
      <h3 class="text-lg font-medium leading-6 text-gray-900">Şifreyi Değiştir</h3>
      <p class="mt-1 text-sm text-gray-500">
        Güvenliğiniz için şifrenizi düzenli olarak güncelleyin.
      </p>
    </div>

    <div class="card-body">
      <form @submit.prevent="handleChangePassword" class="space-y-6">
        <!-- Yeni Şifre -->
        <div>
          <label for="newPassword" class="form-label">Yeni Şifre</label>
          <input
            id="newPassword"
            type="password"
            v-model="newPassword"
            class="form-input"
            required
            autocomplete="new-password"
            :class="{ 'border-red-500': newPasswordError }"
          />
          <p v-if="newPasswordError" class="mt-2 text-sm text-red-600">{{ newPasswordError }}</p>
        </div>

        <!-- Yeni Şifre Tekrar -->
        <div>
          <label for="confirmNewPassword" class="form-label">Yeni Şifre Tekrar</label>
          <input
            id="confirmNewPassword"
            type="password"
            v-model="confirmNewPassword"
            class="form-input"
            required
            autocomplete="new-password"
            :class="{ 'border-red-500': confirmNewPasswordError }"
          />
          <p v-if="confirmNewPasswordError" class="mt-2 text-sm text-red-600">
            {{ confirmNewPasswordError }}
          </p>
        </div>

        <!-- Buton -->
        <div>
          <button type="submit" class="btn btn-primary" :disabled="authStore.loading">
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
            Şifreyi Değiştir
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useToast } from 'vue-toastification'

const authStore = useAuthStore()
const toast = useToast()

const newPassword = ref('')
const confirmNewPassword = ref('')
const newPasswordError = ref(null)
const confirmNewPasswordError = ref(null)

const validateForm = () => {
  newPasswordError.value = null
  confirmNewPasswordError.value = null

  let isValid = true

  if (!newPassword.value) {
    newPasswordError.value = 'Yeni şifre gerekli.'
    isValid = false
  } else if (newPassword.value.length < 8) {
    newPasswordError.value = 'Yeni şifre en az 8 karakter olmalı.'
    isValid = false
  }

  if (newPassword.value !== confirmNewPassword.value) {
    confirmNewPasswordError.value = 'Şifreler eşleşmiyor.'
    isValid = false
  }

  return isValid
}

const handleChangePassword = async () => {
  if (!validateForm()) return

  authStore.loading = true
  authStore.error = null

  try {
    const result = await authStore.changePassword({
      new_password: newPassword.value,
    })

    if (result.success) {
      toast.success(result.message || 'Şifre başarıyla değiştirildi.')
      newPassword.value = ''
      confirmNewPassword.value = ''
    } else {
      toast.error(result.error || 'Şifre değiştirilemedi.')
    }
  } catch (err) {
    console.error('Şifre değiştirme hatası:', err)
    toast.error(authStore.error || 'Beklenmeyen bir hata oluştu.')
  } finally {
    authStore.loading = false
  }
}
</script>
