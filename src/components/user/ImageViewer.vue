<template>
  <div class="flex h-screen bg-gray-50">
    <!-- Sidebar -->
    <div class="w-80 bg-white border-r border-gray-200 flex flex-col">
      <!-- Header -->
      <div class="p-4 border-b border-gray-200">
        <h2 class="text-lg font-semibold text-gray-800">Image Catalog</h2>
        <p class="text-sm text-gray-600">Select dataset and image</p>
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
                  :key="image.image_id"
                  @click="selectImage(image)"
                  :class="[
                    'flex items-center p-3 rounded-lg cursor-pointer transition-colors',
                    selectedImage?.image_id === image.image_id
                      ? 'bg-blue-100 border border-blue-300'
                      : 'hover:bg-gray-50 border border-transparent'
                  ]"
                >
                  <!-- Thumbnail -->
                  <div class="flex-shrink-0 w-12 h-12 bg-gray-200 rounded-lg overflow-hidden">
                    <img
                      :src="getThumbnailUrl(image.image_id)"
                      :alt="image.slide_name || image.image_id"
                      class="w-full h-full object-cover"
                      @error="handleImageError"
                    >
                  </div>

                  <!-- Image Info -->
                  <div class="ml-3 flex-1 min-w-0">
                    <p class="text-sm font-medium text-gray-900 truncate">
                      {{ image.slide_name || image.image_id }}
                    </p>
                    <p class="text-xs text-gray-500 truncate">
                      {{ image.organ_type || 'Unknown' }}
                    </p>
                    <p class="text-xs text-gray-400">
                      ID: {{ image.image_id.substring(0, 8) }}...
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
          <p><span class="font-medium">Name:</span> {{ selectedImage.slide_name || 'N/A' }}</p>
          <p><span class="font-medium">Dataset:</span> {{ selectedImage.dataset_name }}</p>
          <p><span class="font-medium">Organ:</span> {{ selectedImage.organ_type || 'N/A' }}</p>
        </div>
      </div>
    </div>

    <!-- Main Viewer Area -->
    <div class="flex-1 flex flex-col">
      <!-- Top Toolbar (placeholder for future tools) -->
      <div class="h-12 bg-white border-b border-gray-200 flex items-center px-4">
        <div class="flex items-center space-x-4">
          <span class="text-sm text-gray-600">Tools (Coming Soon)</span>
          <!-- Placeholder for future tools: brush, ROI, label etc. -->
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
            <p class="mt-4 text-lg">Loading image...</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, computed, watch, nextTick } from 'vue'
import OpenSeadragon from 'openseadragon'
import imageCatalogAPI from '@/api/image_catalog.js'

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

    // Refs
    const viewerContainer = ref(null)
    let viewer = null

    // Computed
    const groupedImages = computed(() => {
      const groups = {}
      images.value.forEach(image => {
        const dataset = image.dataset_name || 'Unknown'
        if (!groups[dataset]) {
          groups[dataset] = []
        }
        groups[dataset].push(image)
      })

      // Sort images within each group
      Object.keys(groups).forEach(dataset => {
        groups[dataset].sort((a, b) =>
          (a.slide_name || a.image_id).localeCompare(b.slide_name || b.image_id)
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
          (image.slide_name || '').toLowerCase().includes(query) ||
          (image.image_id || '').toLowerCase().includes(query) ||
          (image.organ_type || '').toLowerCase().includes(query) ||
          dataset.toLowerCase().includes(query)
        )

        if (filteredImages.length > 0) {
          filtered[dataset] = filteredImages
        }
      })

      return filtered
    })

    // Methods
    const loadImages = async () => {
      loading.value = true
      error.value = null

      try {
        const response = await imageCatalogAPI.getImages()
        images.value = response.data || []

        // Auto-expand first dataset if available
        if (Object.keys(groupedImages.value).length > 0) {
          const firstDataset = Object.keys(groupedImages.value)[0]
          expandedDatasets.value = [firstDataset]
        }
      } catch (err) {
        error.value = 'Failed to load images. Please try again.'
        console.error('Error loading images:', err)
      } finally {
        loading.value = false
      }
    }

    const toggleDataset = (datasetName) => {
      const index = expandedDatasets.value.indexOf(datasetName)
      if (index > -1) {
        expandedDatasets.value.splice(index, 1)
      } else {
        expandedDatasets.value.push(datasetName)
      }
    }

    const selectImage = async (image) => {
      if (selectedImage.value?.image_id === image.image_id) {
        return // Already selected
      }

      selectedImage.value = image
      await loadImageInViewer(image)
    }

    const loadImageInViewer = async (image) => {
      if (!image || !viewerContainer.value) return

      viewerLoading.value = true

      try {
        // Initialize OpenSeadragon if not already done
        if (!viewer) {
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
            degrees: 0,
            opacity: 1.0,
            compositeOperation: null,
            placeholderFillStyle: '#ccc',
            showSequenceControl: false,
            sequenceMode: false,
            navPrevNextWrap: false
          })

          // Add event listeners
          viewer.addHandler('open', () => {
            viewerLoading.value = false
            console.log('Image opened successfully')
          })

          viewer.addHandler('open-failed', (event) => {
            viewerLoading.value = false
            console.error('Failed to open image:', event)
            alert('Failed to load image. Please try another image.')
          })
        }

        // Get DZI URL for the selected image
        const dziUrl = imageCatalogAPI.getDZIUrl(image.image_id)
        console.log('Loading DZI from:', dziUrl)

        // Open the image in the viewer
        viewer.open(dziUrl)

      } catch (err) {
        viewerLoading.value = false
        console.error('Error loading image in viewer:', err)
        alert('Error loading image. Please try again.')
      }
    }

    const getThumbnailUrl = (imageId) => {
      return imageCatalogAPI.getThumbnailUrl(imageId)
    }

    const handleImageError = (event) => {
      // Replace failed thumbnail with a placeholder
      event.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIHZpZXdCb3g9IjAgMCA0OCA0OCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQ4IiBoZWlnaHQ9IjQ4IiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yNCAzMkMzMC42Mjc0IDMyIDM2IDE5LjI1NDggMzYgM0MzNiAxMy4yNTQ4IDMwLjYyNzQgMjIgMjQgMjJDMTcuMzcyNiAyMiAxMiAxMy4yNTQ4IDEyIDNDMTIgMTkuMjU0OCAxNy4zNzI2IDMyIDI0IDMyWiIgZmlsbD0iIzlDQTNBRiIvPgo8L3N2Zz4K'
    }

    // Lifecycle
    onMounted(() => {
      loadImages()
    })

    // Cleanup
    const cleanup = () => {
      if (viewer) {
        viewer.destroy()
        viewer = null
      }
    }

    // Watch for component unmount
    watch(() => viewer, (newViewer, oldViewer) => {
      if (oldViewer && !newViewer) {
        oldViewer.destroy()
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

      // Refs
      viewerContainer,

      // Computed
      groupedImages,
      filteredGroupedImages,

      // Methods
      loadImages,
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
/* Additional styles for better scrollbar */
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
</style>
