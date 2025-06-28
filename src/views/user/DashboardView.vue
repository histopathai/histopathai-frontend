<template>
  <div class="px-4 py-6 sm:px-0">
    <h1 class="text-3xl font-bold text-gray-900 mb-6">
      Hoş Geldiniz, {{ authStore.user?.displayName || authStore.user?.email }}!
    </h1>
    <p class="text-gray-700">
      Bu sizin kişisel kontrol paneliniz. Yakında daha fazla özellik burada olacak.
    </p>

    <div
      v-if="authStore.user?.status !== 'active'"
      class="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-md flex items-center space-x-3"
    >
      <svg
        class="h-6 w-6 text-blue-400 flex-shrink-0"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        aria-hidden="true"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M13 16h-1v-4h-1m1-4h.01M12 18a6 6 0 100-12 6 6 0 000 12z"
        />
      </svg>
      <p class="text-sm text-blue-800">
        Hesap Durumu: <span class="font-semibold">{{ displayStatus(authStore.user?.status) }}</span
        >. Lütfen e-posta adresinizi doğrulayın ve yöneticinin hesabınızı onaylamasını bekleyin.
      </p>
    </div>

    <div class="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      <div class="card">
        <div class="card-body">
          <h3 class="text-lg font-medium text-gray-900">Son Etkinlikler</h3>
          <p class="mt-2 text-sm text-gray-500">Henüz son etkinlik bulunmamaktadır.</p>
        </div>
      </div>
      <div class="card">
        <div class="card-body">
          <h3 class="text-lg font-medium text-gray-900">Hızlı Bağlantılar</h3>
          <ul class="mt-2 space-y-2">
            <li>
              <router-link to="/dashboard/profile" class="text-primary-600 hover:text-primary-800"
                >Profilimi Yönet</router-link
              >
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
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
      return 'Askıya Alınmış'
    case 'deactivated':
      return 'Devre Dışı'
    default:
      return status || 'Bilinmiyor'
  }
}
</script>
