// src/api/image_catalog.js
import axios from 'axios';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000/api/v1';
const IMG_CATALOG_BASE_URL = BACKEND_URL + '/image-catalog';

// Regular API client (Bearer token için)
const imageCatalogClient = axios.create({
  baseURL: IMG_CATALOG_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Auth client (Session oluşturmak için)
const authClient = axios.create({
  baseURL: BACKEND_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Request interceptors
imageCatalogClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

authClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

class ImageCatalogAPI {
  constructor() {
    this.imageSessionId = null;
    this.sessionExpiry = null;
    this.sessionCreatePromise = null; // Prevent multiple session creation
  }

  /**
   * 🚀 Create optimized session for image viewing
   */
  async createImageSession() {
    if (this.sessionCreatePromise) {
      return this.sessionCreatePromise;
    }
    this.sessionCreatePromise = this._createSessionInternal();
    try {
      return await this.sessionCreatePromise;
    } finally {
      this.sessionCreatePromise = null;
    }
  }

  async _createSessionInternal() {
    try {
      const response = await authClient.post('/auth/image-session');
      this.imageSessionId = response.data.session_id;
      this.sessionExpiry = Date.now() + (response.data.expires_in * 1000);
      return this.imageSessionId;
    } catch (error) {
      console.error('❌ Failed to create image session:', error);
      throw error;
    }
  }

  /**
   * 🎯 Get or create valid session (ultra-fast cached)
   */
  async getValidSessionId() {
    const buffer = 5 * 60 * 1000; // 5 minutes
    if (this.imageSessionId && this.sessionExpiry && (Date.now() + buffer) < this.sessionExpiry) {
      return this.imageSessionId;
    }
    return await this.createImageSession();
  }

  /**
   * 🎬 API Methods
   */
  async getImages(filters = {}) {
    try {
      const sessionId = await this.getValidSessionId();
      const params = { ...filters, session: sessionId };
      const response = await imageCatalogClient.get('/images', { params });
      return response;
    } catch (error) {
      console.error('❌ Error fetching images:', error);
      throw error;
    }
  }

  async getImageById(imageId) {
    if (!imageId) return Promise.reject(new Error('Image ID is required'));
    const sessionId = await this.getValidSessionId();
    return imageCatalogClient.get(`/images/${imageId}`, { params: { session: sessionId } });
  }

  // --- YENİ EKLENEN VE DOĞRU OLAN FONKSİYON ---
  /**
   * 💾 Save annotations for an image
   */
  async saveAnnotations(imageId, payload) {
    if (!imageId) {
      return Promise.reject(new Error('Image ID is required'));
    }
    // Backend'inizde bu endpoint'i oluşturmanız gerekecek.
    return imageCatalogClient.post(`/images/${imageId}/annotations`, payload);
  }
  // --- BİTTİ ---

  /**
   * 🖼️ ULTRA-FAST Asset URLs
   */
  async getDZIUrl(imageId) {
    if (!imageId) throw new Error('Image ID is required');
    const sessionId = await this.getValidSessionId();
    return `${IMG_CATALOG_BASE_URL}/proxy/${imageId}/image.dzi?session=${sessionId}`;
  }

  async getThumbnailUrl(imageId) {
    if (!imageId) throw new Error('Image ID is required');
    const sessionId = await this.getValidSessionId();
    return `${IMG_CATALOG_BASE_URL}/proxy/${imageId}/thumbnail.jpg?session=${sessionId}`;
  }

  /**
   * 📱 Performance monitoring
   */
  async getPerformanceMetrics() {
    try {
      const response = await authClient.get('/auth/image-session/stats');
      const stats = response.data.stats;
      return {
        activeSessions: stats.active_sessions,
        sessionAge: this.sessionExpiry ? Math.max(0, (this.sessionExpiry - Date.now()) / 1000) : 0,
        sessionValid: this.imageSessionId && this.sessionExpiry && Date.now() < this.sessionExpiry,
        totalRequests: stats.sessions.reduce((sum, s) => sum + (s.request_count || 0), 0),
        currentSessionId: this.imageSessionId ? `${this.imageSessionId.substring(0, 8)}...` : null
      };
    } catch (error) {
      console.error('❌ Failed to get performance metrics:', error);
      return { error: 'Failed to fetch metrics', sessionValid: false };
    }
  }

  /**
   * 🧹 Cleanup
   */
  cleanup() {
    if (this.imageSessionId) {
      authClient.delete(`/auth/image-session/${this.imageSessionId}`).catch(err => console.error('Failed to revoke session on cleanup:', err));
      this.imageSessionId = null;
      this.sessionExpiry = null;
    }
  }
}

const imageCatalogAPI = new ImageCatalogAPI();

export default imageCatalogAPI;
