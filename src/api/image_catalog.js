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
    // Prevent multiple simultaneous session creation
    if (this.sessionCreatePromise) {
      return this.sessionCreatePromise;
    }

    this.sessionCreatePromise = this._createSessionInternal();

    try {
      const result = await this.sessionCreatePromise;
      return result;
    } finally {
      this.sessionCreatePromise = null;
    }
  }

  async _createSessionInternal() {
    try {
      console.log('🔄 Creating optimized image session...');
      const response = await authClient.post('/auth/image-session');

      this.imageSessionId = response.data.session_id;
      this.sessionExpiry = Date.now() + (response.data.expires_in * 1000);

      console.log('✅ Image session created:', this.imageSessionId);
      console.log('⏰ Session expires in:', response.data.expires_in, 'seconds');

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
    // Check if current session is valid (with 5 minute buffer for safety)
    const buffer = 5 * 60 * 1000; // 5 minutes
    if (this.imageSessionId && this.sessionExpiry && (Date.now() + buffer) < this.sessionExpiry) {
      return this.imageSessionId;
    }

    console.log('🔄 Session expired or missing, creating new one...');
    return await this.createImageSession();
  }

  /**
   * 📊 Get session statistics (for debugging)
   */
  async getSessionStats() {
    try {
      const response = await authClient.get('/auth/image-session/stats');
      return response.data.stats;
    } catch (error) {
      console.error('❌ Failed to get session stats:', error);
      throw error;
    }
  }

  /**
   * 🗑️ Revoke current session
   */
  async revokeCurrentSession() {
    if (!this.imageSessionId) return;

    try {
      await authClient.delete(`/auth/image-session/${this.imageSessionId}`);
      this.imageSessionId = null;
      this.sessionExpiry = null;
      console.log('✅ Session revoked successfully');
    } catch (error) {
      console.error('❌ Failed to revoke session:', error);
    }
  }

  /**
   * 🎬 API Methods with Bearer token authentication
   * !!! BU KISIM GÜNCELLENDİ - İSTEKLERE SESSION PARAMETRESİ EKLENDİ !!!
   */
  async getImages(filters = {}) {
    console.log('🔍 Fetching images with filters:', filters);

    try {
      // 🚀 Session'ı önceden oluştur ve ID'yi al
      const sessionId = await this.getValidSessionId();
      console.log('✅ Session ready for API request:', sessionId);

      // API parametrelerine session ID'yi ekle
      const params = { ...filters, session: sessionId };

      // Bearer token ve session ile API call yap
      const response = await imageCatalogClient.get('/images', { params });
      return response;
    } catch (error) {
      console.error('❌ Error fetching images:', error);
      throw error;
    }
  }

  async getImageById(imageId) {
    if (!imageId) {
      return Promise.reject(new Error('Image ID is required'));
    }

    // Oluşturulmuş bir session al
    const sessionId = await this.getValidSessionId();

    // Session parametresi ekle
    return imageCatalogClient.get(`/images/${imageId}`, {
      params: { session: sessionId }
    });
  }

  updateImageById(imageId, data) {
    if (!imageId) {
      return Promise.reject(new Error('Image ID is required'));
    }
    return imageCatalogClient.put(`/images/${imageId}`, data);
  }

  deleteImageById(imageId) {
    if (!imageId) {
      return Promise.reject(new Error('Image ID is required'));
    }
    return imageCatalogClient.delete(`/images/${imageId}`);
  }

  /**
   * 🖼️ ULTRA-FAST Asset URLs with session authentication
   */
  async getDZIUrl(imageId) {
    if (!imageId) throw new Error('Image ID is required');

    const sessionId = await this.getValidSessionId();
    const url = `${IMG_CATALOG_BASE_URL}/proxy/${imageId}/image.dzi?session=${sessionId}`;
    console.log('🎯 DZI URL:', url);
    return url;
  }

  async getThumbnailUrl(imageId) {
    if (!imageId) throw new Error('Image ID is required');

    const sessionId = await this.getValidSessionId();
    const url = `${IMG_CATALOG_BASE_URL}/proxy/${imageId}/thumbnail.jpg?session=${sessionId}`;
    return url;
  }

  async getImageTilesBaseUrl(imageId) {
    if (!imageId) throw new Error('Image ID is required');

    const sessionId = await this.getValidSessionId();
    // OpenSeadragon will append tile paths like: /12/5_3.jpg
    return `${IMG_CATALOG_BASE_URL}/proxy/${imageId}/image_files/?session=${sessionId}&tile=`;
  }

  /**
   * 🔧 Advanced: Optimized tile source for OpenSeadragon
   */
  async createOptimizedTileSource(imageId) {
    try {
      console.log('🔧 Creating optimized tile source for:', imageId);

      // Get DZI content through session
      const sessionId = await this.getValidSessionId();
      const dziUrl = `${IMG_CATALOG_BASE_URL}/proxy/${imageId}/image.dzi?session=${sessionId}`;

      const dziResponse = await axios.get(dziUrl);
      console.log('✅ DZI content fetched');

      // Parse DZI XML
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(dziResponse.data, 'text/xml');
      const image = xmlDoc.getElementsByTagName('Image')[0];
      const size = xmlDoc.getElementsByTagName('Size')[0];

      const tileSize = parseInt(image.getAttribute('TileSize'));
      const overlap = parseInt(image.getAttribute('Overlap'));
      const format = image.getAttribute('Format');
      const width = parseInt(size.getAttribute('Width'));
      const height = parseInt(size.getAttribute('Height'));

      console.log('📐 Image dimensions:', { width, height, tileSize, format });

      // Return OpenSeadragon compatible tile source
      return {
        type: 'image',
        url: `${IMG_CATALOG_BASE_URL}/proxy/${imageId}/image_files/{z}/{x}_{y}.${format}?session=${sessionId}`,
        buildPyramid: false,
        width: width,
        height: height,
        tileSize: tileSize,
        tileOverlap: overlap,
        minLevel: 0,
        maxLevel: Math.ceil(Math.log2(Math.max(width, height) / tileSize))
      };
    } catch (error) {
      console.error('❌ Failed to create optimized tile source:', error);
      throw error;
    }
  }

  /**
   * 📱 Performance monitoring ve debugging
   */
  async getPerformanceMetrics() {
    try {
      const stats = await this.getSessionStats();
      return {
        activeSessions: stats.active_sessions,
        sessionAge: this.sessionExpiry ? Math.max(0, (this.sessionExpiry - Date.now()) / 1000) : 0,
        sessionValid: this.imageSessionId && this.sessionExpiry && Date.now() < this.sessionExpiry,
        totalRequests: stats.sessions.reduce((sum, s) => sum + (s.request_count || 0), 0),
        currentSessionId: this.imageSessionId ? this.imageSessionId.substring(0, 8) + '...' : null
      };
    } catch (error) {
      console.error('❌ Failed to get performance metrics:', error);
      return {
        error: 'Failed to fetch metrics',
        sessionValid: false
      };
    }
  }

  /**
   * 🧹 Cleanup - component unmount'ta çağırın
   */
  cleanup() {
    this.revokeCurrentSession();
  }
}

// Singleton instance
const imageCatalogAPI = new ImageCatalogAPI();

export default imageCatalogAPI;
