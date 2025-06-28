import { defineStore } from 'pinia'
import authAPI from '@/api/auth'

// Kullanıcı durumları
export const USER_STATUS = {
  PENDING: 'pending',
  ACTIVE: 'active',
  SUSPENDED: 'suspended',
}

// Roller
export const USER_ROLES = {
  ADMIN: 'admin',
  USER: 'user',
  VIEWER: 'viewer',
  UNASSIGNED: 'unassigned',
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    token: null,
    isAuthenticated: false,
    loading: false,
    error: null,
  }),

  getters: {
    isAdmin: (state) => {
      return state.user?.role === USER_ROLES.ADMIN
    },

    isActive: (state) => {
      return state.user?.status === USER_STATUS.ACTIVE
    },

    canAccess: (state) => {
      return state.isAuthenticated && state.user?.status === USER_STATUS.ACTIVE
    },

    userInitials: (state) => {
      if (!state.user?.displayName) return ''
      return state.user.displayName
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    },
  },

  actions: {
    initializeAuth() {
      const token = localStorage.getItem('auth_token')
      const userData = localStorage.getItem('user_data')
      if (token && userData) {
        try {
          this.token = token
          this.user = JSON.parse(userData)
          this.isAuthenticated = true
        } catch (error) {
          console.error('Stored user data parsing error:', error)
          this.clearAuth()
        }
      }
    },

    async register(payload) {
      this.loading = true
      this.error = null

      try {
        const response = await authAPI.user.register(payload)
        if (response.data.user) {
          this.user = response.data.user
        }

        return {
          success: true,
          message: response.data.message || 'Kayıt başarılı',
        }
      } catch (error) {
        console.error('Kayıt hatası:', error)
        this.error = error.response?.data?.message || 'Kayıt başarısız'
        return { success: false, message: this.error }
      } finally {
        this.loading = false
      }
    },

    async verifyToken(token) {
      this.loading = true
      this.error = null

      try {
        const response = await authAPI.user.verifyToken({ token })
        if (response.data.user) {
          this.setAuthData(token, response.data.user)
          return { success: true, user: response.data.user }
        }
        return { success: false, message: 'Geçersiz token veya kullanıcı bulunamadı' }
      } catch (error) {
        console.error('Token doğrulama hatası:', error)
        this.error = error.response?.data?.message || 'Token doğrulanamadı'
        this.clearAuth()
        return { success: false, message: this.error }
      } finally {
        this.loading = false
      }
    },

    async getProfile() {
      this.loading = true
      this.error = null

      try {
        const response = await authAPI.user.getProfile()
        if (response.data.user) {
          this.user = response.data.user
          localStorage.setItem('user_data', JSON.stringify(this.user))
          return { success: true, user: response.data.user }
        }
        return { success: false, error: 'Profil bulunamadı' }
      } catch (error) {
        this.error = error.response?.data?.message || 'Profil alınamadı'
        return { success: false, error: this.error }
      } finally {
        this.loading = false
      }
    },

    async changePassword(payload) {
      this.loading = true
      this.error = null

      try {
        await authAPI.user.changePassword(payload)
        return { success: true, message: 'Şifre başarıyla değiştirildi' }
      } catch (error) {
        this.error = error.response?.data?.message || 'Şifre değiştirilemedi'
        return { success: false, error: this.error }
      } finally {
        this.loading = false
      }
    },

    async deleteAccount() {
      this.loading = true
      this.error = null

      try {
        await authAPI.user.deleteAccount()
        this.clearAuth()
        return { success: true, message: 'Hesap başarıyla silindi' }
      } catch (error) {
        this.error = error.response?.data?.message || 'Hesap silinemedi'
        return { success: false, error: this.error }
      } finally {
        this.loading = false
      }
    },

    setAuthData(token, user) {
      this.token = token
      this.user = user
      this.isAuthenticated = true
      localStorage.setItem('auth_token', token)
      localStorage.setItem('user_data', JSON.stringify(user))
    },

    clearAuth() {
      this.user = null
      this.token = null
      this.isAuthenticated = false
      this.error = null
      localStorage.removeItem('auth_token')
      localStorage.removeItem('user_data')
    },

    logout() {
      this.clearAuth()
    },
  },
})
