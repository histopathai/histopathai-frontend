import { defineStore } from 'pinia'
import authAPI from '@/api/auth'

export const USER_STATUS = {
  PENDING: 'pending',
  ACTIVE: 'active',
  SUSPENDED: 'suspended',
  DEACTIVATED: 'deactivated',
}

export const USER_ROLES = {
  ADMIN: 'admin',
  USER: 'user',
  VIEWER: 'viewer',
  UNASSIGNED: 'unassigned',
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    token: localStorage.getItem('auth_token') || null,
    isAuthenticated: false,
    loading: false,
    error: null,
  }),

  getters: {
    isAdmin: (state) => state.user?.role === USER_ROLES.ADMIN,
    isActive: (state) => state.user?.status === USER_STATUS.ACTIVE,
    canAccess: (state) => state.isAuthenticated && state.user?.status === USER_STATUS.ACTIVE,
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
        } catch {
          this.clearAuth()
        }
      }
    },

    async register(payload) {
      this.loading = true
      this.error = null
      try {
        const res = await authAPI.user.register(payload)
        if (res.data.user) this.user = res.data.user
        return { success: true, message: res.data.message || 'Kayıt başarılı' }
      } catch (err) {
        this.error = err.response?.data?.message || 'Kayıt başarısız'
        return { success: false, message: this.error }
      } finally {
        this.loading = false
      }
    },

    async verifyToken(token) {
      this.loading = true
      this.error = null
      try {
        const res = await authAPI.user.verifyToken(token)
        if (res.data.user) {
          this.setAuthData(token, res.data.user)
          return { success: true, user: res.data.user }
        }
        return { success: false, message: 'Geçersiz token veya kullanıcı bulunamadı' }
      } catch (err) {
        this.error = err.response?.data?.message || 'Token doğrulanamadı'
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
        const res = await authAPI.user.getProfile()
        if (res.data.user) {
          this.user = res.data.user
          localStorage.setItem('user_data', JSON.stringify(this.user))
          return { success: true, user: res.data.user }
        }
        return { success: false, error: 'Profil bulunamadı' }
      } catch (err) {
        this.error = err.response?.data?.message || 'Profil alınamadı'
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
      } catch (err) {
        this.error = err.response?.data?.message || 'Şifre değiştirilemedi'
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
      } catch (err) {
        this.error = err.response?.data?.message || 'Hesap silinemedi'
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
