import axios from 'axios'
const API_AUTH_BASE_URL = import.meta.env.VITE_AUTH_API_BASE_URL || 'http://localhost:8000/api/v1'

const authClient = axios.create({
  baseURL: API_AUTH_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor
authClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

// Response interceptor
authClient.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    // Invalid or expired token
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token')
      localStorage.removeItem('user_data')

      // Redirect to login page
      if (!window.location.pathname.includes('/auth/')) {
        window.location.href = '/auth/login'
      }
    }
    return Promise.reject(error)
  },
)

class UserAPI {
  constructor(client) {
    this.client = client
  }
  register(payload) {
    return this.client.post('/auth/register', payload)
  }
  // Backend'deki POST /auth/verify rotasına uyumlu
  verifyToken(token) {
    return this.client.post('/auth/verify', { token })
  }
  // Backend'deki GET /user/profile rotasına uyumlu
  getProfile() {
    return this.client.get('/user/profile')
  }
  // Backend'deki PUT /user/password rotasına uyumlu (ChangePasswordSelf)
  changePassword(payload) {
    return this.client.put('/user/password', payload)
  }
  // Backend'deki DELETE /user/account rotasına uyumlu
  deleteAccount() {
    return this.client.delete('/user/account')
  }
}

class AdminAPI {
  constructor(client) {
    this.client = client
  }
  // Backend'deki GET /admin/users/ rotasına (sondaki eğik çizgi ile) uyumlu
  getAllUsers() {
    return this.client.get('/admin/users/')
  }
  getUser(uid) {
    return this.client.get(`/admin/users/${uid}`)
  }
  approveUser(uid) {
    return this.client.post(`/admin/users/${uid}/approve`, { role: 'user' })
  }
  suspendUser(uid) {
    return this.client.post(`/admin/users/${uid}/suspend`)
  }

  // Admin tarafında belirli bir kullanıcının şifresini değiştirmek için (YENİ EKLEME)
  // Backend'deki PUT /admin/users/:uid/password rotasına uyumlu olacak.
  changeUserPassword(uid, payload) {
    return this.client.put(`/admin/users/${uid}/password`, payload)
  }
  makeAdmin(uid) {
    return this.client.post(`/admin/users/${uid}/promote`)
  }
}

class AuthAPI {
  constructor(client) {
    this.client = client
    this.user = new UserAPI(client)
    this.admin = new AdminAPI(client)
  }
}
const authAPI = new AuthAPI(authClient)

export default authAPI
