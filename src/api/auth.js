import axios from 'axios'

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8080/api/v1'

const authClient = axios.create({
  baseURL: BACKEND_URL, // https://auth-service.../api/v1
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

authClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    console.log('Auth request to:', config.baseURL + config.url); // Debug logging
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

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
    return this.client.post('/auth/verify', { token })
  }

  getProfile() {
    return this.client.get('/user/profile')
  }

  changePassword(payload) {
    return this.client.put('/auth/password', payload)
  }

  deleteAccount() {
    return this.client.delete('/user/account')
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
    return this.client.post(`/admin/users/${uid}/approve`)
  }

  suspendUser(uid) {
    return this.client.post(`/admin/users/${uid}/suspend`)
  }

  changeUserPassword(uid, payload) {
   
    return this.client.post(`/admin/users/${uid}/change-password`, payload)
  }

  makeAdmin(uid) {
    return this.client.post(`/admin/users/${uid}/make-admin`)
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