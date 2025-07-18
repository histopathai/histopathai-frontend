import axios from 'axios';
const API_IMAGE_CATALOG_BASE_URL = import.meta.env.VITE_IMAGE_CATALOG_API_BASE_URL || 'http://localhost:3232/api/v1';


const imageCatalogClient = axios.create({
  baseURL : API_IMAGE_CATALOG_BASE_URL,
  timeout : 10000,
  headers: {
    'Content-Type': 'application/json',
  }
})


//Request intercepter to attach authentication token
imageCatalogClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

//Response intercepter to handle errors globally
imageCatalogClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    //if 401 Unauthorized, clear the token and redirect to login
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('user_data');
      if (!window.location.pathname.includes('/auth/')) {
        window.location.href = '/auth/login';
        }
    }
    return Promise.reject(error);
  }
);


class ImageCatalogAPI {
  constructor(client) {
    this.client = client;
  }


  /**
   * Retrieves a single image by its ID.
   * Corresponds to GET /api/v1/images/:image_id
   * @param {string} imageId - The ID of the image to retrieve.
   * @returns {Promise<AxiosResponse>} - The response containing the image data.
   */
  getImageById(imageId) {
    if (!imageId) {
      return Promise.reject(new Error('Image ID is required'));
    }
    return this.client.get(`/images/${imageId}`)
  }


  /**
   * Updates an image's metadata by its ID.
   * Corresponds to PUT /api/v1/images/:image_id
   * @param {string} imageId - The ID of the image to update.
   * @param {Object} data - The metadata to update.
   * @returns {Promise<AxiosResponse>} A promise that resolves with the updated image data.
   */
  updateImageById(imageId, data) {
    if (!imageId) {
      return Promise.reject(new Error('Image ID is required'));
    }
    return this.client.put(`/images/${imageId}`, data);
  }

  /**
   * Retrieves a list of images with optional filtering.
   * Corresponds to: GET /api/v1/images
   * @param {object} [filters] - An object containing filter parameters (e.g., { dataset_name: "CMB-BRCA", organ_type: "breast" }).
   * @returns {Promise<AxiosResponse>} A promise that resolves with a list of images.
   */
  getImages(filters = {}) {
    return this.client.get('/images', { params: filters });
  }

  /**
   * Proxies a GCS object, used for fetching image tiles, DZI files, and thumbnails.
   * Corresponds to: GET /api/v1/proxy/*objectPath
   * @param {string} objectPath - The Full path of the object within the GCS bucket
   * @returns {Promise<AxiosResponse>} A promise that resolves with the GCS object's content.
   */
  getGCSObject(objectPath) {
    if (!objectPath) {
      return Promise.reject(new Error('Object path is required'));
    }

    //The server-side trimPrfix will handle("/"), so we should not include a leading slash
    const cleanedObjectPath = objectPath.startsWith('/') ? objectPath.slice(1) : objectPath;
    return this.client.get(`/proxy/${cleanedObjectPath}`, {
      responseType: `blob`, // Ensure the response is treated as a blob
    });
  }

  /**
   * Helper function to get the DZI file URL.
   * @param {string} imageId - The ID of the image.
   * @returns {string} The URL for the DZI file.
   */
  getDZIUrl(imageId) {
    if (!imageId) {
      throw new Error('Image ID is required to get DZI URL');
    }
    return `${API_IMAGE_CATALOG_BASE_URL}/images/${imageId}/image.dzi`;
  }


  /**
   * Helper function to get the thumbnail URL.
   * @param {string} imageId - The ID of the image.
   * @returns {string} The full URL for the thumbnail.
   */
  getThumbnailUrl(imageId) {

    if (!imageId) {
      throw new Error('Image ID is required to get thumbnail URL');
    }
    return `${API_IMAGE_CATALOG_BASE_URL}/proxy/${imageId}/thumbnail.jpg`;
  }

  /**
   * Helper function to construct the base URL for image tiles.
   * This is typically used by an OpenSeadragon viewer.
   * @param {string} imageId - The ID of the image.
   * @returns {string} The base URL for the image tiles.
   */
  getImageTilesBaseUrl(imageId) {
    if (!imageId) {
      throw new Error('Image ID is required to get image tiles base URL');
    }

    // OpenSeadragon will append the tile path (e.g., /10/0_0.jpeg) to this base URL
    return `${API_IMAGE_CATALOG_BASE_URL}/proxy/${imageId}/image_files/`;
  }
}

const imageCatalogAPI = new ImageCatalogAPI(imageCatalogClient);

export default imageCatalogAPI;
