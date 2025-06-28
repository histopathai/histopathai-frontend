<template>
  <div class="min-h-screen bg-gray-50">
    <nav class="bg-white shadow-sm border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <!-- Sol - Uygulama Adı -->
          <div class="flex items-center">
            <h1 class="text-xl font-semibold text-gray-900">{{ appName }}</h1>
          </div>

          <!-- Sağ - Admin Link + Kullanıcı Menüsü -->
          <div class="flex items-center space-x-4">
            <router-link
              v-if="authStore.isAdmin"
              to="/admin"
              class="text-primary-600 hover:text-primary-800 text-sm font-medium"
            >
              Admin Paneli
            </router-link>

            <div class="relative">
              <button
                @click="showUserMenu = !showUserMenu"
                class="flex items-center space-x-2 text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                <div
                  class="h-8 w-8 rounded-full bg-primary-600 flex items-center justify-center overflow-hidden"
                >
                  <span class="text-white text-sm font-medium">
                    {{ authStore.userInitials }}
                  </span>
                </div>
                <span class="text-gray-700">
                  {{ authStore.user?.displayName || authStore.user?.email || 'Kullanıcı' }}
                </span>
              </button>

              <div
                v-if="showUserMenu"
                v-click-away="() => (showUserMenu = false)"
                class="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50"
              >
                <router-link
                  to="/dashboard/profile"
                  class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  @click="showUserMenu = false"
                >
                  Profil
                </router-link>
                <div class="border-t border-gray-100"></div>
                <button
                  @click="handleLogout"
                  class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Çıkış Yap
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>

    <!-- Ana içerik -->
    <main class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <!-- Hesap onay bekliyorsa uyarı -->
      <div
        v-if="authStore.user?.status === 'pending'"
        class="mb-6 bg-yellow-50 border border-yellow-200 rounded-md p-4"
      >
        <div class="flex">
          <div class="flex-shrink-0">
            <svg
              class="h-5 w-5 text-yellow-400"
              fill="currentColor"
              viewBox="0 0 20 20"
              aria-hidden="true"
            >
              <path
                fill-rule="evenodd"
                clip-rule="evenodd"
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
              />
            </svg>
          </div>
          <div class="ml-3">
            <h3 class="text-sm font-medium text-yellow-800">Hesabınız Onay Bekliyor</h3>
            <p class="mt-1 text-sm text-yellow-700">
              Hesabınız yönetici onayı beklemektedir. Bazı özellikler sınırlı olabilir.
            </p>
          </div>
        </div>
      </div>

      <!-- Router View: Sayfa içerikleri burada yüklenecek -->
      <router-view />
    </main>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useToast } from 'vue-toastification'

const router = useRouter()
const authStore = useAuthStore()
const toast = useToast()

const appName = import.meta.env.VITE_APP_NAME || 'HistopathAI'
const showUserMenu = ref(false)

const handleLogout = () => {
  authStore.logout()
  toast.success('Başarıyla çıkış yapıldı.')
  router.push('/auth/login')
}

// v-click-away direktifi: Menü dışına tıklamayı yakalayıp menüyü kapatır
const vClickAway = {
  beforeMount(el, binding) {
    el.clickOutsideEvent = (event) => {
      if (!(el === event.target || el.contains(event.target))) {
        binding.value(event, el)
      }
    }
    document.addEventListener('click', el.clickOutsideEvent)
  },
  unmounted(el) {
    document.removeEventListener('click', el.clickOutsideEvent)
  },
}
</script>

<style scoped>
/* DashboardLayout'a özel stiller buraya eklenebilir */
</style>
