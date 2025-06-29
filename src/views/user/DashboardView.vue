<template>
  <div class="px-4 py-6 sm:px-0">
    <h1 class="text-3xl font-bold text-gray-900 mb-6">
      Hoş Geldiniz, {{ authStore.user?.DisplayName || authStore.user?.Email }}!
    </h1>
    <p class="text-gray-700">
      Bu sizin kişisel kontrol paneliniz. Yakında daha fazla özellik burada olacak.
    </p>

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
</script>
<style scoped></style>
