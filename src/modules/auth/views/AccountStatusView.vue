<template>
  <main class="py-8 text-center">
    <h2 class="text-3xl font-bold text-gray-900">Hesap Durumu</h2>
    <div
      class="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-md flex items-center space-x-3"
    >
      <svg
        class="h-6 w-6 text-yellow-400"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4.038c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
        />
      </svg>
      <p class="text-sm text-yellow-800">
        Hesap Durumu:
        <span class="font-semibold">{{ displayStatus(authStore.user?.status) }}</span
        >. Lütfen bir yöneticiyle iletişime geçin.
      </p>
    </div>
    <div class="mt-6">
      <router-link to="/auth/login" class="btn btn-primary">Giriş Sayfasına Dön</router-link>
    </div>
  </main>
</template>

<script setup>
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()

const displayStatus = (status) => {
  switch (status) {
    case 'pending':
      return 'Onay Bekliyor'
    case 'active':
      return 'Aktif'
    case 'suspended':
      return 'Askıya Alındı'
    case 'deactivated':
      return 'Devre Dışı'
    default:
      return 'Bilinmiyor'
  }
}
</script>
