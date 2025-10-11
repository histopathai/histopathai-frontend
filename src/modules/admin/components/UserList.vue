<template>
  <div class="card">
    <div class="card-header flex justify-between items-center">
      <h3 class="text-lg font-medium text-gray-900">Tüm Kullanıcılar</h3>
      <button @click="fetchUsers" class="btn btn-outline btn-sm">
        <svg
          v-if="loading"
          class="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-700"
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
          ></circle>
          <path
            class="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
        <svg
          v-else
          class="-ml-0.5 mr-2 h-4 w-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004 12v1a8.001 8.001 0 0115.356-2L20 10V4m-9 9l3 3m0 0l-3 3m3-3H4"
          ></path>
        </svg>
        Yenile
      </button>
    </div>

    <div class="card-body">
      <div v-if="loading" class="text-center py-8 text-gray-500">
        <p>Kullanıcılar yükleniyor...</p>
      </div>

      <div v-else-if="error" class="text-center py-8 text-red-600">
        <p>{{ error }}</p>
        <button @click="fetchUsers" class="btn btn-secondary btn-sm mt-4">Tekrar Dene</button>
      </div>

      <div v-else-if="users.length === 0" class="text-center py-8 text-gray-500">
        <p>Henüz kayıtlı kullanıcı bulunmamaktadır.</p>
      </div>

      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <UserCard
          v-for="user in users"
          :key="user.uid"
          :user="user"
          @user-updated="handleUserUpdated"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useToast } from 'vue-toastification'
import UserCard from './UserCard.vue'
import authAPI from '@/api/auth' // Doğru authAPI import edildi

const users = ref([])
const loading = ref(false)
const error = ref(null)
const toast = useToast()

const fetchUsers = async () => {
  loading.value = true
  error.value = null
  try {
    const response = await authAPI.admin.getAllUsers()
    users.value = response.data.users || []
    toast.success('Kullanıcılar başarıyla yüklendi.')
  } catch (err) {
    console.error('Kullanıcıları çekme hatası:', err)
    error.value = err.response?.data?.message || 'Kullanıcılar yüklenemedi.'
    toast.error(error.value)
  } finally {
    loading.value = false
  }
}

const handleUserUpdated = (updatedUser) => {
  const index = users.value.findIndex((u) => u.uid === updatedUser.uid)
  if (index !== -1) {
    users.value[index] = updatedUser
  }
}

onMounted(() => {
  fetchUsers()
})
</script>

<style scoped>
/* UserList'e özel stiller buraya eklenebilir */
</style>
