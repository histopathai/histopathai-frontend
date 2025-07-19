<template>
  <div class="flex h-screen bg-gray-50">
    <!-- Performance Stats (Development only) -->
    <div v-if="showPerformanceStats" class="absolute top-4 right-4 z-50 bg-black bg-opacity-80 text-white p-3 rounded text-xs">
      <div>Session: {{ performanceMetrics.currentSessionId || 'None' }}</div>
      <div>Valid: {{ performanceMetrics.sessionValid ? '✅' : '❌' }}</div>
      <div>Age: {{ Math.round(performanceMetrics.sessionAge) }}s</div>
      <div>Requests: {{ performanceMetrics.totalRequests }}</div>
      <button @click="showPerformanceStats = false" class="text-red-400 mt-1">×</button>
    </div>

    <!-- Sidebar -->
    <div class="w-80 bg-white border-r border-gray-200 flex flex-col">
      <!-- Header with Performance Toggle -->
      <div class="p-4 border-b border-gray-200">
        <div class="flex justify-between items-center">
          <div>
            <h2 class="text-lg font-semibold text-gray-800">Image Catalog</h2>
            <p class="text-sm text-gray-600">Session System</p>
          </div>
          <button
            @click="togglePerformanceStats"
            class="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded"
            title="Toggle performance stats"
          >
            📊
          </button>
        </div>
      </div>

      <!-- Search -->
      <div class="p-4 border-b border-gray-200">
        <div class="relative">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search images..."
            class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
          <svg class="absolute left-3 top-2.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
          </svg>
        </div>
      </div>

      <!-- Dataset Tree -->
      <div class="flex-1 overflow-y-auto">
        <div class="p-4 space-y-2">
          <div v-if="loading" class="text-center py-8">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
            <p class="mt-2 text-sm text-gray-600">Loading images...</p>
          </div>

          <div v-else-if="error" class="text-center py-8 text-red-600">
            <p>{{ error }}</p>
            <button @click="loadImages" class="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
              Retry
            </button>
          </div>

          <div v-else>
            <div v-for="(images, datasetName) in filteredGroupedImages" :key="datasetName" class="mb-4">
              <!-- Dataset Header -->
              <div
                @click="toggleDataset(datasetName)"
                class="flex items-center justify-between p-3 bg-gray-100 rounded-lg cursor-pointer hover:bg-gray-200 transition-colors"
              >
                <div class="flex items-center space-x-2">
                  <svg
                    :class="[
                      'h-4 w-4 text-gray-600 transition-transform',
                      expandedDatasets.includes(datasetName) ? 'transform rotate-90' : ''
                    ]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                  </svg>
                  <span class="font-medium text-gray-800">{{ datasetName }}</span>
                </div>
                <span class="text-sm text-gray-500 bg-gray-300 px-2 py-1 rounded-full">
                  {{ images.length }}
                </span>
              </div>

              <!-- Images List -->
              <div v-if="expandedDatasets.includes(datasetName)" class="mt-2 ml-4 space-y-1">
                <div
                  v-for="image in images"
                  :key="image.id"
                  @click="selectImage(image)"
                  :class="[
                    'flex items-center p-3 rounded-lg cursor-pointer transition-colors',
                    selectedImage?.id === image.id
                      ? 'bg-blue-100 border border-blue-300'
                      : 'hover:bg-gray-50 border border-transparent'
                  ]"
                >
                  <!-- Thumbnail -->
                  <div class="flex-shrink-0 w-12 h-12 bg-gray-200 rounded-lg overflow-hidden">
                    <img
                      :src="getThumbnailUrl(image.id)"
                      :alt="image.file_name || image.id"
                      class="w-full h-full object-cover"
                      @error="handleImageError"
                      loading="lazy"
                      :data-image-id="image.id"
                    >
                  </div>

                  <!-- Image Info -->
                  <div class="ml-3 flex-1 min-w-0">
                    <p class="text-sm font-medium text-gray-900 truncate">
                      {{ image.file_name || image.id }}
                    </p>
                    <p class="text-xs text-gray-500 truncate">
                      {{ image.organ_type || 'Unknown' }}
                    </p>
                    <p class="text-xs text-gray-400">
                      ID: {{ image.id.substring(0, 8) }}...
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Selected Image Info -->
      <div v-if="selectedImage" class="p-4 border-t border-gray-200 bg-gray-50">
        <h3 class="text-sm font-medium text-gray-800 mb-2">Selected Image</h3>
        <div class="text-xs text-gray-600 space-y-1">
          <p><span class="font-medium">Name:</span> {{ selectedImage.file_name || 'N/A' }}</p>
          <p><span class="font-medium">Dataset:</span> {{ selectedImage.dataset_name }}</p>
          <p><span class="font-medium">Organ:</span> {{ selectedImage.organ_type || 'N/A' }}</p>
        </div>
      </div>
    </div>

    <!-- Main Viewer Area -->
    <div class="flex-1 flex flex-col">
      <!-- Top Toolbar -->
      <div class="h-12 bg-white border-b border-gray-200 flex items-center px-4 justify-between">
        <div class="flex items-center space-x-4">
          <span class="text-sm text-gray-600">🚀 Ultra-Fast Session System</span>
          <div v-if="selectedImage" class="text-xs text-gray-500">
            Loading: {{ selectedImage.file_name }}
          </div>
        </div>
        <div class="flex items-center space-x-2 text-xs text-gray-500">
          <span>Session: {{ sessionStatus }}</span>
          <button
            @click="refreshSession"
            class="ml-2 text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded hover:bg-blue-200"
            title="Refresh session"
          >
            🔄
          </button>
        </div>
      </div>

      <!-- Viewer Container -->
      <div class="flex-1 relative">
        <div v-if="!selectedImage" class="flex items-center justify-center h-full text-gray-500">
          <div class="text-center">
            <svg class="mx-auto h-16 w-16 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
            </svg>
            <h3 class="mt-4 text-lg font-medium">Select an image to view</h3>
            <p class="mt-2 text-sm text-gray-400">Choose an image from the sidebar to start viewing</p>
          </div>
        </div>

        <div
          v-else
          ref="viewerContainer"
          class="w-full h-full bg-black"
          :class="{ 'opacity-50': viewerLoading }"
        >
          <!-- OpenSeadragon will mount here -->
        </div>

        <!-- Loading overlay for viewer -->
        <div v-if="viewerLoading" class="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div class="text-center text-white">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
            <p class="mt-4 text-lg">Loading tiles...</p>
            <p class="text-sm opacity-75">{{ loadingProgress }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, computed, nextTick, onUnmounted } from 'vue'
import OpenSeadragon from 'openseadragon'
import ImageCatalogAPI from '@/api/image_catalog.js' // 🚀 API import

export default {
  name: 'ImageViewer',
  setup() {
    // Reactive data
    const images = ref([])
    const selectedImage = ref(null)
    const expandedDatasets = ref([])
    const searchQuery = ref('')
    const loading = ref(false)
    const error = ref(null)
    const viewerLoading = ref(false)
    const loadingProgress = ref('')
    const sessionStatus = ref('Not created')
    const showPerformanceStats = ref(false)
    const performanceMetrics = ref({})

    // Refs
    const viewerContainer = ref(null)
    let viewer = null

    // Cache for thumbnails
    const thumbnailCache = {}

    // Computed
    const groupedImages = computed(() => {
      if (!Array.isArray(images.value)) {
        console.warn('images.value is not an array:', images.value)
        return {}
      }

      const groups = {}
      images.value.forEach(image => {
        const dataset = image.dataset_name || 'Unknown'
        if (!groups[dataset]) {
          groups[dataset] = []
        }
        groups[dataset].push(image)
      })

      Object.keys(groups).forEach(dataset => {
        groups[dataset].sort((a, b) =>
          (a.file_name || a.id).localeCompare(b.file_name || b.id)
        )
      })

      return groups
    })

    const filteredGroupedImages = computed(() => {
      if (!searchQuery.value.trim()) {
        return groupedImages.value
      }

      const filtered = {}
      const query = searchQuery.value.toLowerCase()

      Object.keys(groupedImages.value).forEach(dataset => {
        const filteredImages = groupedImages.value[dataset].filter(image =>
          (image.file_name || '').toLowerCase().includes(query) ||
          (image.id || '').toLowerCase().includes(query) ||
          (image.organ_type || '').toLowerCase().includes(query) ||
          dataset.toLowerCase().includes(query)
        )

        if (filteredImages.length > 0) {
          filtered[dataset] = filteredImages
        }
      })

      return filtered
    })

    // 🚀 Functions
    const loadImages = async () => {
      try {
        loading.value = true
        error.value = null

        console.log('🔍 Loading images with API...')

        // 1. Öncelikle geçerli bir session olduğundan emin ol
        await ImageCatalogAPI.getValidSessionId()

        // 2. Görüntüleri getir - getImages fonksiyonu içinde session otomatik olarak eklenecek
        const response = await ImageCatalogAPI.getImages()

        // 3. Yanıtı işle - yanıt yapısını kontrol et
        let imageList = []

        if (response.data && response.data.images && Array.isArray(response.data.images)) {
          imageList = response.data.images
          console.log('✅ Using response.data.images:', imageList.length, 'images')
        } else if (Array.isArray(response.data)) {
          imageList = response.data
          console.log('✅ Using response.data directly:', imageList.length, 'images')
        } else if (response.data && response.data.message) {
          console.log('ℹ️ No images found:', response.data.message)
          imageList = []
        } else {
          console.error('❌ Unexpected response structure:', response.data)
          imageList = []
        }

        images.value = imageList
        console.log('🔍 Final images array:', images.value.length, 'images')

        // Auto-expand first dataset
        if (images.value.length > 0 && expandedDatasets.value.length === 0) {
          const firstDataset = Object.keys(groupedImages.value)[0]
          if (firstDataset) {
            expandedDatasets.value.push(firstDataset)
          }
        }

        // Update session status
        await updateSessionStatus()

      } catch (err) {
        console.error('❌ Error loading images:', err)

        // Hata mesajını detaylı analiz et
        let errorMessage = 'Failed to load images'

        if (err.response) {
          // Sunucu yanıtı varsa
          const status = err.response.status
          errorMessage = `Server error (${status})`

          if (err.response.data && err.response.data.message) {
            errorMessage = err.response.data.message
          } else if (status === 500) {
            errorMessage = 'Internal server error. Please try refreshing your session.'
          } else if (status === 401) {
            errorMessage = 'Authentication error. Please log in again.'
            // Session yenileme dene
            try {
              await ImageCatalogAPI.createImageSession()
              errorMessage += ' (Trying to create a new session...)'
            } catch (sessionErr) {
              errorMessage += ' (Failed to create a new session)'
            }
          }
        } else if (err.request) {
          // İstek yapıldı ama yanıt alınamadı
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
        console.log('🔄 Session refreshed manually')
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
        // Session'ı yenile/oluştur
        const sessionId = await ImageCatalogAPI.getValidSessionId()
        loadingProgress.value = `Setting up viewer with session: ${sessionId.substring(0, 8)}...`

        // Initialize OpenSeadragon if not already done
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
            // 🚀 Optimizations for performance
            preload: true,
            maxImageCacheCount: 200, // Cache more tiles
            timeout: 120000, // 2 minute timeout
          })

          viewer.addHandler('open', () => {
            viewerLoading.value = false
            loadingProgress.value = ''
            console.log('✅ Image opened successfully with API session')
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

          // Hata işleme için yeni olay işleyicisi
          viewer.addHandler('tile-load-failed', (event) => {
            console.error('❌ Tile load failed:', event)
            loadingProgress.value = 'Error loading tiles. Retrying...'
          })
        }

        // 🚀 Get DZI URL with session
        loadingProgress.value = 'Creating session...'
        const dziUrl = await ImageCatalogAPI.getDZIUrl(image.id)
        console.log('🎯 Loading DZI from:', dziUrl)

        loadingProgress.value = 'Loading image data...'
        viewer.open(dziUrl)

      } catch (err) {
        viewerLoading.value = false
        loadingProgress.value = ''
        console.error('❌ Error loading image in viewer:', err)

        // Hata detaylarını analiz et
        let errorMessage = 'Error loading image. Please try again.'

        if (err.response && err.response.status) {
          errorMessage = `Server error (${err.response.status}): `

          if (err.response.data && err.response.data.message) {
            errorMessage += err.response.data.message
          } else if (err.response.status === 401) {
            errorMessage = 'Session expired. Creating new session...'

            // Session'ı yenilemeyi dene
            try {
              await ImageCatalogAPI.createImageSession()
              setTimeout(() => loadImageInViewer(image), 1000) // 1 saniye sonra tekrar dene
              return // Fonksiyondan çık, tekrar deneyecek
            } catch (sessionErr) {
              errorMessage = 'Failed to create new session. Please refresh the page.'
            }
          }
        }

        alert(errorMessage)
      }
    }

    const getThumbnailUrl = (imageId) => {
      // Önbellekte varsa hemen döndür
      if (thumbnailCache[imageId]) {
        return thumbnailCache[imageId]
      }

      // Geçici placeholder döndür
      const placeholder = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIHZpZXdCb3g9IjAgMCA0OCA0OCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQ4IiBoZWlnaHQ9IjQ4IiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yNCAzMkMzMC42Mjc0IDMyIDM2IDE5LjI1NDggMzYgM0MzNiAxMy4yNTQ4IDMwLjYyNzQgMjIgMjQgMjJDMTcuMzcyNiAyMiAxMiAxMy4yNTQ4IDEyIDNDMTIgMTkuMjU0OCAxNy4zNzI2IDMyIDI0IDMyWiIgZmlsbD0iIzlDQTNBRiIvPgo8L3N2Zz4K'

      // Asenkron olarak gerçek URL'yi yükle
      ImageCatalogAPI.getThumbnailUrl(imageId)
        .then(url => {
          // Önbelleğe ekle
          thumbnailCache[imageId] = url

          // Tüm bu ID'ye sahip img elementlerini güncelle
          document.querySelectorAll(`img[data-image-id="${imageId}"]`).forEach(img => {
            if (img.src.startsWith('data:')) { // Sadece placeholder'ları güncelle
              img.src = url
            }
          })
        })
        .catch(err => {
          console.error('Failed to load thumbnail:', err)
        })

      return placeholder
    }

    const toggleDataset = (datasetName) => {
      const index = expandedDatasets.value.indexOf(datasetName)
      if (index > -1) {
        expandedDatasets.value.splice(index, 1)
      } else {
        expandedDatasets.value.push(datasetName)
      }
    }

    const handleImageError = (event) => {
      // Replace failed thumbnail with a placeholder
      event.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIHZpZXdCb3g9IjAgMCA0OCA0OCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQ4IiBoZWlnaHQ9IjQ4IiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yNCAzMkMzMC42Mjc0IDMyIDM2IDE5LjI1NDggMzYgM0MzNiAxMy4yNTQ4IDMwLjYyNzQgMjIgMjQgMjJDMTcuMzcyNiAyMiAxMiAxMy4yNTQ4IDEyIDNDMTIgMTkuMjU0OCAxNy4zNzI2IDMyIDI0IDMyWiIgZmlsbD0iIzlDQTNBRiIvPgo8L3N2Zz4K'
    }

    // Cleanup function
    const cleanup = () => {
      if (viewer) {
        viewer.destroy()
        viewer = null
      }
      // Cleanup API
      ImageCatalogAPI.cleanup()
    }

    // Lifecycle
    onMounted(() => {
      console.log('🚀 ImageViewer mounted - Enterprise Session System')
      loadImages()
    })

    onUnmounted(() => {
      cleanup()
    })

    // Auto-update performance metrics every 30 seconds
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
      // Data
      images,
      selectedImage,
      expandedDatasets,
      searchQuery,
      loading,
      error,
      viewerLoading,
      loadingProgress,
      sessionStatus,
      showPerformanceStats,
      performanceMetrics,

      // Refs
      viewerContainer,

      // Computed
      groupedImages,
      filteredGroupedImages,

      // Methods
      loadImages,
      updateSessionStatus,
      refreshSession,
      togglePerformanceStats,
      toggleDataset,
      selectImage,
      getThumbnailUrl,
      handleImageError,
      cleanup
    }
  },

  beforeUnmount() {
    this.cleanup()
  }
}
</script>

<style scoped>
/* Performance stats styling */
.absolute {
  z-index: 9999;
}

/* scrollbar */
.overflow-y-auto::-webkit-scrollbar {
  width: 6px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: #a1a1a1;
}

/* Custom transitions */
.transition-colors {
  transition: background-color 0.2s ease, border-color 0.2s ease;
}

.transition-transform {
  transition: transform 0.2s ease;
}

/* Loading animations */
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
</style>
