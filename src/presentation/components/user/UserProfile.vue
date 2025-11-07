<template>
  <div class="card">
    <div class="card-header">
      <h3 class="text-lg font-medium leading-6 text-gray-900">Profil Bilgileri</h3>
      <p class="mt-1 text-sm text-gray-500">Hesap bilgilerinizi ve tercihlerinizi güncelleyin.</p>
    </div>
    <div class="card-body">
      <dl class="divide-y divide-gray-200">
        <div class="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4">
          <dt class="text-sm font-medium text-gray-500">UID</dt>
          <dd class="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
            {{ authStore.user?.uid || 'Bilinmiyor' }}
          </dd>
        </div>

        <div class="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4">
          <dt class="text-sm font-medium text-gray-500">E-posta Adresi</dt>
          <dd class="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
            {{ authStore.user?.email || 'Bilinmiyor' }}
          </dd>
        </div>

        <div class="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4">
          <dt class="text-sm font-medium text-gray-500">Görünen Ad</dt>
          <dd class="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
            {{ authStore.user?.displayName || 'Belirtilmemiş' }}
          </dd>
        </div>

        <div class="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4">
          <dt class="text-sm font-medium text-gray-500">Hesap Durumu</dt>
          <dd class="mt-1 text-sm sm:col-span-2 sm:mt-0">
            <span :class="statusClass(authStore.user?.status)">
              {{ displayStatus(authStore.user?.status) }}
            </span>
          </dd>
        </div>

        <div class="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4">
          <dt class="text-sm font-medium text-gray-500">Kullanıcı Rolü</dt>
          <dd class="mt-1 text-sm sm:col-span-2 sm:mt-0">
            <span :class="roleClass(authStore.user?.role)">
              {{ displayRole(authStore.user?.role) }}
            </span>
          </dd>
        </div>

        <template v-if="authStore.user?.createdAt">
          <div class="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4">
            <dt class="text-sm font-medium text-gray-500">Kayıt Tarihi</dt>
            <dd class="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
              {{ formatDate(authStore.user.createdAt) }}
            </dd>
          </div>
        </template>

        <template v-if="authStore.user?.updatedAt">
          <div class="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4">
            <dt class="text-sm font-medium text-gray-500">Son Güncelleme</dt>
            <dd class="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
              {{ formatDate(authStore.user.updatedAt) }}
            </dd>
          </div>
        </template>

        <template v-if="authStore.user?.approvalDate && authStore.user?.adminApproved">
          <div class="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4">
            <dt class="text-sm font-medium text-gray-500">Onay Tarihi</dt>
            <dd class="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
              {{ formatDate(authStore.user.approvalDate) }}
            </dd>
          </div>
        </template>
      </dl>
    </div>
  </div>
</template>

<script setup>
import { useAuthStore, USER_STATUS, USER_ROLES } from '@/application/state/auth.store.js'; // <-- YENİ YOL
import { onMounted, inject } from 'vue';
import { useToast } from 'vue-toastification';

const authStore = useAuthStore()
const toast = useToast()
const authService = inject('authService')

onMounted(async () => {
  // Sadece state'de kullanıcı yoksa servisi çağır
  if (authStore.isAuthenticated && !authStore.user) {
    // ESKİ KOD: const result = await authStore.getProfile()
    // YENİ KOD:
    const result = await authService.handleGetProfile();

    if (!result.success) {
      toast.error(result.message || 'Profil bilgileri yüklenemedi.');
    }
  }
});

const displayStatus = (status) => {
  switch (status) {
    case USER_STATUS.PENDING:
      return 'Onay Bekliyor'
    case USER_STATUS.ACTIVE:
      return 'Aktif'
    case USER_STATUS.SUSPENDED:
      return 'Askıya Alınmış'
    case USER_STATUS.DEACTIVATED:
      return 'Devre Dışı Bırakılmış'
    default:
      return status || 'Bilinmiyor'
  }
}

const statusClass = (status) => {
  switch (status) {
    case USER_STATUS.ACTIVE:
      return 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800'
    case USER_STATUS.PENDING:
      return 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800'
    case USER_STATUS.SUSPENDED:
      return 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800'
    case USER_STATUS.DEACTIVATED:
      return 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800'
    default:
      return ''
  }
}

const displayRole = (role) => {
  switch (role) {
    case USER_ROLES.ADMIN:
      return 'Yönetici'
    case USER_ROLES.USER:
      return 'Kullanıcı'
    case USER_ROLES.VIEWER:
      return 'İzleyici'
    case USER_ROLES.UNASSIGNED:
      return 'Atanmamış'
    default:
      return role || 'Bilinmiyor'
  }
}

const roleClass = (role) => {
  switch (role) {
    case USER_ROLES.ADMIN:
      return 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800'
    case USER_ROLES.USER:
      return 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800'
    case USER_ROLES.VIEWER:
      return 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800'
    case USER_ROLES.UNASSIGNED:
      return 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800'
    default:
      return ''
  }
}

const formatDate = (dateString) => {
  if (!dateString) return 'Bilinmiyor'
  const date = new Date(dateString)
  if (isNaN(date)) return 'Bilinmiyor'
  return date.toLocaleDateString('tr-TR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}
</script>
