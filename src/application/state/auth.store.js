import { defineStore } from 'pinia'

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
    setLoading(isLoading) {
      this.loading = isLoading;
    },

    setError(errorMessage) {
      this.error = errorMessage;
    },

    setRegistrationSuccess(userData) {
      // Kayıt başarılı olduğunda ne oluyorsa (belki kullanıcıyı state'e al, belki alma)
      // Şimdilik sadece hatayı temizleyelim
      this.error = null;
      // VEYA:
      // this.user = userData; // Eğer backend hemen kullanıcıyı döndürüyorsa
    },

    setAuthData(token, user) {
      this.token = token;
      this.user = user;
      this.isAuthenticated = true;
      this.error = null;
      localStorage.setItem('auth_token', token);
      localStorage.setItem('user_data', JSON.stringify(user));
    },

    clearAuth() {
      this.user = null;
      this.token = null;
      this.isAuthenticated = false;
      this.error = null;
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_data');
    },

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

    /**
     * Alınan profil verisini state'e işler.
     */
    setUserProfile(user) {
      this.user = user;
      localStorage.setItem('user_data', JSON.stringify(user));
    },

    logout() {
      this.clearAuth()
    },
  },
})
