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
  verifyToken(token) {
    return this.client.get(`/auth/verify-token/${token}`)
  }
  getProfile() {
    return this.client.get('/auth/profile')
  }
  changePassword(payload) {
    return this.client.post('/auth/password', payload)
  }
  deleteAccount() {
    return this.client.delete('/auth/delete-account')
  }
}

class AdminAPI {
  constructor(client) {
    this.client = client
  }
  getAllUsers() {
    return this.client.get('/admin/users')
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
  activateUser(uid) {
    return this.client.post(`/admin/users/${uid}/activate`)
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
