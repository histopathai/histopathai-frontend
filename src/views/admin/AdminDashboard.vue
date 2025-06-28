<template>
  <div class="px-4 py-6 sm:px-0">
    <h1 class="text-3xl font-bold text-gray-900 mb-6">Yönetici Paneli</h1>
    <p class="text-gray-700">
      Hoş Geldiniz, <strong>{{ authStore.user?.displayName || authStore.user?.email }}</strong
      >! Bu sizin yönetici kontrol paneliniz. Buradan kullanıcıları ve sistem ayarlarını
      yönetebilirsiniz.
    </p>

    <div class="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      <section class="card" aria-labelledby="user-management-title">
        <div class="card-body">
          <h3 id="user-management-title" class="text-lg font-medium text-gray-900">
            Kullanıcı Yönetimi
          </h3>
          <p class="mt-2 text-sm text-gray-500">
            Sistemdeki tüm kullanıcıları görüntüleyin ve yönetin.
          </p>
          <div class="mt-4">
            <router-link
              to="/admin/users"
              class="btn btn-primary btn-sm"
              role="button"
              aria-label="Kullanıcılar sayfasına git"
            >
              Kullanıcılara Git
            </router-link>
          </div>
        </div>
      </section>

      <section class="card" aria-labelledby="system-stats-title">
        <div class="card-body">
          <h3 id="system-stats-title" class="text-lg font-medium text-gray-900">
            Sistem İstatistikleri
          </h3>
          <p class="mt-2 text-sm text-gray-500">
            Yakında genel sistem istatistikleri burada olacak.
          </p>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
</script>

<style scoped>
/* AdminDashboard'a özel stiller buraya eklenebilir */
</style>
