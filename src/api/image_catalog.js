// src/api/image_catalog.js

import axios from 'axios';

// Keep your existing environment variable
const API_IMAGE_CATALOG_BASE_URL = import.meta.env.VITE_IMAGE_CATALOG_API_BASE_URL || 'http://localhost:3232/api/v1';

const imageCatalogClient = axios.create({
  baseURL: API_IMAGE_CATALOG_BASE_URL, // This is https://auth-service.../api/v1
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  }
})

// Request interceptor
imageCatalogClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
imageCatalogClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      console.error("API Error: Unauthorized access. Redirecting to login.");
      // localStorage.removeItem('auth_token');
      // localStorage.removeItem('user_data');
      // if (!window.location.pathname.includes('/auth/')) {
      //   window.location.href = '/auth/login';
      // }
    }
    else {
      console.error("API Error:", error.message || error);
    }
    return Promise.reject(error);
  }
);

class ImageCatalogAPI {
  constructor(client) {
    this.client = client;
  }

  // NOW THE PATHS SHOULD INCLUDE /image-catalog since baseURL is /api/v1
  getImageById(imageId) {
    if (!imageId) {
      return Promise.reject(new Error('Image ID is required'));
    }
    return this.client.get(`/image-catalog/images/${imageId}`) // /api/v1 + /image-catalog/images/${imageId}
  }

  updateImageById(imageId, data) {
    if (!imageId) {
      return Promise.reject(new Error('Image ID is required'));
    }
    return this.client.put(`/image-catalog/images/${imageId}`, data); // /api/v1 + /image-catalog/images/${imageId}
  }

  getImages(filters = {}) {
    return this.client.get('/image-catalog/images', { params: filters }); // /api/v1 + /image-catalog/images
  }

  getGCSObject(objectPath) {
    if (!objectPath) {
      return Promise.reject(new Error('Object path is required'));
    }
    const cleanedObjectPath = objectPath.startsWith('/') ? objectPath.slice(1) : objectPath;
    return this.client.get(`/image-catalog/proxy/${cleanedObjectPath}`, { // /api/v1 + /image-catalog/proxy/...
      responseType: `blob`,
    });
  }

  // For DZI and Thumbnail URLs, construct full URLs
  getDZIUrl(imageId) {
    if (!imageId) {
      throw new Error('Image ID is required to get DZI URL');
    }
    return `${API_IMAGE_CATALOG_BASE_URL}/image-catalog/images/${imageId}/image.dzi`;
  }

  getThumbnailUrl(imageId) {
    if (!imageId) {
      throw new Error('Image ID is required to get thumbnail URL');
    }
    return `${API_IMAGE_CATALOG_BASE_URL}/image-catalog/proxy/${imageId}/thumbnail.jpg`;
  }

  getImageTilesBaseUrl(imageId) {
    if (!imageId) {
      throw new Error('Image ID is required to get image tiles base URL');
    }
    return `${API_IMAGE_CATALOG_BASE_URL}/image-catalog/proxy/${imageId}/image_files/`;
  }
}

const imageCatalogAPI = new ImageCatalogAPI(imageCatalogClient);

export default imageCatalogAPI;
