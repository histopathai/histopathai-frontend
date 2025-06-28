<template>
  <div class="card">
    <div class="card-body">
      <div class="flex items-center space-x-4">
        <div
          class="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-700 font-medium"
        >
          {{ userInitials }}
        </div>
        <div>
          <p class="text-lg font-semibold text-gray-900">{{ user.displayName || user.email }}</p>
          <p class="text-sm text-gray-500">{{ user.email }}</p>
        </div>
      </div>

      <div class="mt-4 space-y-2">
        <div class="flex justify-between items-center">
          <span class="text-sm font-medium text-gray-600">Durum:</span>
          <span :class="statusClass(user.status)">{{ displayStatus(user.status) }}</span>
        </div>
        <div class="flex justify-between items-center">
          <span class="text-sm font-medium text-gray-600">Rol:</span>
          <span :class="roleClass(user.role)">{{ displayRole(user.role) }}</span>
        </div>
        <div class="flex justify-between items-center" v-if="user.adminApproved">
          <span class="text-sm font-medium text-gray-600">Admin Onaylı:</span>
          <span
            class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"
            >Evet</span
          >
        </div>
        <div class="flex justify-between items-center" v-else>
          <span class="text-sm font-medium text-gray-600">Admin Onaylı:</span>
          <span
            class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800"
            >Hayır</span
          >
        </div>
        <div class="flex justify-between items-center" v-if="user.createdAt">
          <span class="text-sm font-medium text-gray-600">Kayıt Tarihi:</span>
          <span class="text-sm text-gray-900">{{ formatDate(user.createdAt) }}</span>
        </div>
      </div>

      <div class="mt-6 flex flex-wrap gap-2">
        <button
          v-if="user.status === USER_STATUS.PENDING || !user.adminApproved"
          @click="handleApproveUser"
          :disabled="loading"
          class="btn btn-primary btn-sm"
        >
          Onayla
        </button>

        <button
          v-if="user.status === USER_STATUS.ACTIVE"
          @click="handleSuspendUser"
          :disabled="loading"
          class="btn btn-secondary btn-sm"
        >
          Askıya Al
        </button>

        <button
          v-if="user.status === USER_STATUS.SUSPENDED"
          @click="handleActivateUser"
          :disabled="loading"
          class="btn btn-primary btn-sm"
        >
          Etkinleştir
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps, ref, computed } from 'vue'
import authAPI from '@/api/auth'
import { useToast } from 'vue-toastification'
import { USER_STATUS, USER_ROLES } from '@/stores/auth'

const props = defineProps({
  user: {
    type: Object,
    required: true,
  },
})

const emit = defineEmits(['user-updated'])

const loading = ref(false)
const toast = useToast()
const authAdminAPI = authAPI.admin

const userInitials = computed(() => {
  if (!props.user?.displayName) return props.user.email ? props.user.email[0].toUpperCase() : ''
  return props.user.displayName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
})

const displayStatus = (status) => {
  switch (status) {
    case USER_STATUS.PENDING:
      return 'Onay Bekliyor'
    case USER_STATUS.ACTIVE:
      return 'Aktif'
    case USER_STATUS.SUSPENDED:
      return 'Askıya Alınmış'
    default:
      return status
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
      return role
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
  if (!dateString) return 'N/A'
  const date = new Date(dateString)
  return date.toLocaleDateString('tr-TR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const executeAdminAction = async (actionFn, successMsg, errorMsg) => {
  loading.value = true
  try {
    await actionFn(props.user.uid)
    toast.success(successMsg)
    const updatedUser = await authAdminAPI.getUser(props.user.uid)
    emit('user-updated', updatedUser.data.user)
  } catch (err) {
    console.error('Admin aksiyon hatası:', err)
    toast.error(err.response?.data?.message || errorMsg)
  } finally {
    loading.value = false
  }
}

const handleApproveUser = () => {
  executeAdminAction(
    (uid) => authAdminAPI.approveUser(uid, { role: USER_ROLES.USER }),
    'Kullanıcı başarıyla onaylandı.',
    'Kullanıcı onaylanırken hata oluştu.',
  )
}

const handleSuspendUser = () => {
  executeAdminAction(
    authAdminAPI.suspendUser,
    'Kullanıcı başarıyla askıya alındı.',
    'Kullanıcı askıya alınırken hata oluştu.',
  )
}

const handleActivateUser = () => {
  executeAdminAction(
    authAdminAPI.activateUser,
    'Kullanıcı başarıyla etkinleştirildi.',
    'Kullanıcı etkinleştirilirken hata oluştu.',
  )
}
</script>

<style scoped>
/* UserCard'a özel stiller buraya eklenebilir */
</style>
