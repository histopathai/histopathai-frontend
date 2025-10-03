<template>
  <div class="viewer-container">
    <!-- Performance Stats (Development only) -->
    <div v-if="showPerformanceStats" class="performance-stats">
      <div>Session: {{ performanceMetrics.currentSessionId || 'None' }}</div>
      <div>Valid: {{ performanceMetrics.sessionValid ? '✅' : '❌' }}</div>
      <div>Age: {{ Math.round(performanceMetrics.sessionAge) }}s</div>
      <div>Requests: {{ performanceMetrics.totalRequests }}</div>
      <button @click="showPerformanceStats = false" class="close-stats">×</button>
    </div>

    <!-- Sidebar Component -->
    <Sidebar
      :images="images"
      :selected-image="selectedImage"
      :search-query="searchQuery"
      :loading="loading"
      :error="error"
      @select-image="selectImage"
      @reload-images="loadImages"
      @toggle-performance-stats="togglePerformanceStats"
      @update:search-query="searchQuery = $event"
    />

    <!-- Main Viewer Area -->
    <div class="main-viewer">
      <!-- Top Toolbar -->
      <div class="toolbar">
        <div class="toolbar-left">
          <span class="toolbar-title">🚀 Ultra-Fast Session System</span>
          <div v-if="selectedImage" class="toolbar-info">
            Loading: {{ selectedImage.file_name }}
          </div>
        </div>
        <div class="toolbar-right">
          <span>Session: {{ sessionStatus }}</span>
          <button
            @click="refreshSession"
            class="refresh-btn"
            title="Refresh session"
          >
            🔄
          </button>
        </div>
      </div>

      <!-- Viewer Container -->
      <div class="viewer-wrapper">
        <div v-if="!selectedImage" class="empty-state">
          <div class="empty-content">
            <svg class="empty-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
            </svg>
            <h3 class="empty-title">Select an image to view</h3>
            <p class="empty-subtitle">Choose an image from the sidebar to start viewing</p>
          </div>
        </div>

        <div
          v-else
          ref="viewerContainer"
          class="osd-container"
          :class="{ 'loading': viewerLoading }"
        >
          <!-- OpenSeadragon will mount here -->
        </div>

        <!-- Loading overlay for viewer -->
        <div v-if="viewerLoading" class="loading-overlay">
          <div class="loading-content">
            <div class="spinner-large"></div>
            <p class="loading-title">Loading tiles...</p>
            <p class="loading-progress">{{ loadingProgress }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, nextTick, onUnmounted } from 'vue'
import OpenSeadragon from 'openseadragon'
import ImageCatalogAPI from '@/api/image_catalog.js'
import ViewerSidebar from './Sidebar.vue'

export default {
  name: 'ImageViewer',
  components: {
    Sidebar: ViewerSidebar
  },
  setup() {
    const images = ref([])
    const selectedImage = ref(null)
    const searchQuery = ref('')
    const loading = ref(false)
    const error = ref(null)
    const viewerLoading = ref(false)
    const loadingProgress = ref('')
    const sessionStatus = ref('Not created')
    const showPerformanceStats = ref(false)
    const performanceMetrics = ref({})

    const viewerContainer = ref(null)
    let viewer = null



    const loadImages = async () => {
      try {
        loading.value = true
        error.value = null

        await ImageCatalogAPI.getValidSessionId()

        const response = await ImageCatalogAPI.getImages()

        let imageList = []

        if (response.data && response.data.images && Array.isArray(response.data.images)) {
          imageList = response.data.images
        } else if (Array.isArray(response.data)) {
          imageList = response.data
        } else if (response.data && response.data.message) {
          imageList = []
        } else {
          console.error('❌ Unexpected response structure:', response.data)
          imageList = []
        }

        images.value = imageList

        await updateSessionStatus()

      } catch (err) {
        console.error('❌ Error loading images:', err)

        let errorMessage = 'Failed to load images'

        if (err.response) {
          const status = err.response.status
          errorMessage = `Server error (${status})`

          if (err.response.data && err.response.data.message) {
            errorMessage = err.response.data.message
          } else if (status === 500) {
            errorMessage = 'Internal server error. Please try refreshing your session.'
          } else if (status === 401) {
            errorMessage = 'Authentication error. Please log in again.'
            try {
              await ImageCatalogAPI.createImageSession()
              errorMessage += ' (Trying to create a new session...)'
            } catch (sessionErr) {
              errorMessage += ' (Failed to create a new session)'
            }
          }
        } else if (err.request) {
          errorMessage = 'No response from server. Please check your connection.'
        }

        error.value = errorMessage
        images.value = []
      } finally {
        loading.value = false
      }
    }

    const updateSessionStatus = async () => {
      try {
        const metrics = await ImageCatalogAPI.getPerformanceMetrics()
        performanceMetrics.value = metrics
        sessionStatus.value = metrics.sessionValid ? 'Active' : 'Inactive'
      } catch (error) {
        sessionStatus.value = 'Error'
        console.error('Failed to update session status:', error)
      }
    }

    const refreshSession = async () => {
      try {
        sessionStatus.value = 'Refreshing...'
        await ImageCatalogAPI.createImageSession()
        await updateSessionStatus()
      } catch (error) {
        console.error('❌ Failed to refresh session:', error)
        sessionStatus.value = 'Error'
      }
    }

    const togglePerformanceStats = async () => {
      showPerformanceStats.value = !showPerformanceStats.value
      if (showPerformanceStats.value) {
        await updateSessionStatus()
      }
    }

    const selectImage = async (image) => {
      if (selectedImage.value?.id === image.id) {
        return
      }

      selectedImage.value = image
      await loadImageInViewer(image)
    }

    const loadImageInViewer = async (image) => {
      if (!image || !viewerContainer.value) return

      viewerLoading.value = true
      loadingProgress.value = 'Initializing session...'

      try {
        const sessionId = await ImageCatalogAPI.getValidSessionId()
        loadingProgress.value = `Setting up viewer with session: ${sessionId.substring(0, 8)}...`

        if (!viewer) {
          loadingProgress.value = 'Setting up viewer...'
          await nextTick()

          viewer = OpenSeadragon({
            element: viewerContainer.value,
            prefixUrl: '//openseadragon.github.io/openseadragon/images/',
            showNavigationControl: true,
            showZoomControl: true,
            showHomeControl: true,
            showFullPageControl: true,
            showRotationControl: true,
            mouseNavEnabled: true,
            showNavigator: true,
            navigatorPosition: 'TOP_RIGHT',
            navigatorSizeRatio: 0.15,
            defaultZoomLevel: 0,
            minZoomLevel: 0.1,
            maxZoomLevel: 10,
            visibilityRatio: 0.5,
            constrainDuringPan: true,
            animationTime: 1.0,
            blendTime: 0.1,
            alwaysBlend: false,
            autoHideControls: false,
            immediateRender: false,
            preserveImageSizeOnResize: true,
            preload: true,
            maxImageCacheCount: 200,
            timeout: 120000,
          })

          viewer.addHandler('open', () => {
            viewerLoading.value = false
            loadingProgress.value = ''
            updateSessionStatus()
          })

          viewer.addHandler('open-failed', (event) => {
            viewerLoading.value = false
            loadingProgress.value = ''
            console.error('❌ Failed to open image:', event)
            alert('Failed to load image. Please try another image.')
          })

          viewer.addHandler('tile-loaded', () => {
            loadingProgress.value = 'Loading tiles...'
          })

          viewer.addHandler('tile-load-failed', (event) => {
            console.error('❌ Tile load failed:', event)
            loadingProgress.value = 'Error loading tiles. Retrying...'
          })
        }

        loadingProgress.value = 'Creating session...'
        const dziUrl = await ImageCatalogAPI.getDZIUrl(image.id)

        loadingProgress.value = 'Loading image data...'
        viewer.open(dziUrl)

      } catch (err) {
        viewerLoading.value = false
        loadingProgress.value = ''
        console.error('❌ Error loading image in viewer:', err)

        let errorMessage = 'Error loading image. Please try again.'

        if (err.response && err.response.status) {
          errorMessage = `Server error (${err.response.status}): `

          if (err.response.data && err.response.data.message) {
            errorMessage += err.response.data.message
          } else if (err.response.status === 401) {
            errorMessage = 'Session expired. Creating new session...'

            try {
              await ImageCatalogAPI.createImageSession()
              setTimeout(() => loadImageInViewer(image), 1000)
              return
            } catch (sessionErr) {
              errorMessage = 'Failed to create new session. Please refresh the page.'
            }
          }
        }

        alert(errorMessage)
      }
    }

    const cleanup = () => {
      if (viewer) {
        viewer.destroy()
        viewer = null
      }
      ImageCatalogAPI.cleanup()
    }

    onMounted(() => {
      loadImages()
    })

    onUnmounted(() => {
      cleanup()
    })

    let metricsInterval
    onMounted(() => {
      metricsInterval = setInterval(async () => {
        if (showPerformanceStats.value) {
          await updateSessionStatus()
        }
      }, 30000)
    })

    onUnmounted(() => {
      if (metricsInterval) {
        clearInterval(metricsInterval)
      }
    })

    return {
      images,
      selectedImage,
      searchQuery,
      loading,
      error,
      viewerLoading,
      loadingProgress,
      sessionStatus,
      showPerformanceStats,
      performanceMetrics,
      viewerContainer,
      loadImages,
      updateSessionStatus,
      refreshSession,
      togglePerformanceStats,
      selectImage,
      cleanup
    }
  },

  beforeUnmount() {
    this.cleanup()
  }
}
</script>

<style scoped>
/* Main Container */
.viewer-container {
  display: flex;
  height: 100vh;
  background-color: #f9fafb;
}

/* Performance Stats */
.performance-stats {
  position: absolute;
  top: 1rem;
  right: 1rem;
  z-index: 9999;
  background-color: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 0.75rem;
  border-radius: 0.375rem;
  font-size: 0.75rem;
  line-height: 1rem;
}

.close-stats {
  color: #f87171;
  margin-top: 0.25rem;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1.25rem;
}

/* Main Viewer */
.main-viewer {
  flex: 1;
  display: flex;
  flex-direction: column;
}

/* Toolbar */
.toolbar {
  height: 3rem;
  background-color: white;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  align-items: center;
  padding: 0 1rem;
  justify-content: space-between;
}

.toolbar-left {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.toolbar-title {
  font-size: 0.875rem;
  color: #4b5563;
  line-height: 1.25rem;
}

.toolbar-info {
  font-size: 0.75rem;
  color: #6b7280;
  line-height: 1rem;
}

.toolbar-right {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.75rem;
  color: #6b7280;
  line-height: 1rem;
}

.refresh-btn {
  margin-left: 0.5rem;
  font-size: 0.75rem;
  background-color: #dbeafe;
  color: #2563eb;
  padding: 0.25rem 0.5rem;
  border-radius: 0.375rem;
  border: none;
  cursor: pointer;
  line-height: 1rem;
}

.refresh-btn:hover {
  background-color: #bfdbfe;
}

/* Viewer Wrapper */
.viewer-wrapper {
  flex: 1;
  position: relative;
}

/* Empty State */
.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #6b7280;
}

.empty-content {
  text-align: center;
}

.empty-icon {
  margin: 0 auto;
  height: 4rem;
  width: 4rem;
  color: #d1d5db;
}

.empty-title {
  margin-top: 1rem;
  font-size: 1.125rem;
  font-weight: 500;
  line-height: 1.75rem;
}

.empty-subtitle {
  margin-top: 0.5rem;
  font-size: 0.875rem;
  color: #9ca3af;
  line-height: 1.25rem;
}

/* OpenSeadragon Container */
.osd-container {
  width: 100%;
  height: 100%;
  background-color: black;
}

.osd-container.loading {
  opacity: 0.5;
}

/* Loading Overlay */
.loading-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(0, 0, 0, 0.5);
}

.loading-content {
  text-align: center;
  color: white;
}

.spinner-large {
  animation: spin 1s linear infinite;
  border-radius: 9999px;
  height: 3rem;
  width: 3rem;
  border-width: 2px;
  border-color: white;
  border-bottom-color: transparent;
  margin: 0 auto;
}

.loading-title {
  margin-top: 1rem;
  font-size: 1.125rem;
  line-height: 1.75rem;
}

.loading-progress {
  font-size: 0.875rem;
  opacity: 0.75;
  line-height: 1.25rem;
}

/* Loading Animation */
@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
</style>
