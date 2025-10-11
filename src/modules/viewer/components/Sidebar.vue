<template>
  <div class="sidebar">
    <div class="sidebar-header">
      <div class="header-content">
        <div>
          <h2 class="header-title">Image Catalog</h2>
          <p class="header-subtitle">Session System</p>
        </div>
        <button
          @click="$emit('toggle-performance-stats')"
          class="stats-toggle-btn"
          title="Toggle performance stats"
        >
          📊
        </button>
      </div>
    </div>

    <div class="search-container">
      <div class="search-wrapper">
        <input
          :value="searchQuery"
          @input="$emit('update:searchQuery', $event.target.value)"
          type="text"
          placeholder="Search images..."
          class="search-input"
        >
        <svg class="search-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
        </svg>
      </div>
    </div>

    <div class="dataset-tree">
      <div class="tree-content">
        <div v-if="loading" class="loading-state">
          <div class="spinner"></div>
          <p class="loading-text">Loading images...</p>
        </div>

        <div v-else-if="error" class="error-state">
          <p>{{ error }}</p>
          <button @click="$emit('reload-images')" class="retry-btn">
            Retry
          </button>
        </div>

        <div v-else-if="!images || images.length === 0" class="empty-state-sidebar">
          <p>No images found in the catalog.</p>
        </div>

        <div v-else>
          <div v-for="(datasetImages, datasetName) in filteredGroupedImages" :key="datasetName" class="dataset-group">
            <div
              @click="toggleDataset(datasetName)"
              class="dataset-header"
            >
              <div class="dataset-header-content">
                <svg
                  :class="['chevron-icon', { 'rotated': expandedDatasets.includes(datasetName) }]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                </svg>
                <span class="dataset-name">{{ datasetName }}</span>
              </div>
              <span class="image-count">
                {{ datasetImages.length }}
              </span>
            </div>
            <div v-if="expandedDatasets.includes(datasetName)" class="images-list">
              <div
                v-for="image in datasetImages"
                :key="image.id"
                @click="$emit('select-image', image)"
                :class="['image-item', { 'selected': selectedImage?.id === image.id }]"
              >
                <div class="thumbnail">
                  <img
                    :src="getThumbnailUrl(image.id)"
                    :alt="image.file_name || image.id"
                    class="thumbnail-img"
                    @error="handleImageError"
                    loading="lazy"
                    :data-image-id="image.id"
                  >
                </div>
                <div class="image-info">
                  <p class="image-name">
                    {{ image.file_name || image.id }}
                  </p>
                  <p class="image-organ">
                    {{ image.organ_type || 'Unknown' }}
                  </p>
                  <p class="image-id">
                    ID: {{ image.id.substring(0, 8) }}...
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="selectedImage" class="selected-info">
      <h3 class="selected-title">Selected Image</h3>
      <div class="selected-details">
        <p><span class="detail-label">Name:</span> {{ selectedImage.file_name || 'N/A' }}</p>
        <p><span class="detail-label">Dataset:</span> {{ selectedImage.dataset_name }}</p>
        <p><span class="detail-label">Organ:</span> {{ selectedImage.organ_type || 'N/A' }}</p>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue'
import ImageCatalogAPI from '@/api/image_catalog.js'

export default {
  name: 'ViewerSidebar',
  props: {
    images: {
      type: Array,
      default: () => []
    },
    selectedImage: {
      type: Object,
      default: null
    },
    searchQuery: {
      type: String,
      default: ''
    },
    loading: {
      type: Boolean,
      default: false
    },
    error: {
      type: String,
      default: null
    }
  },
  emits: ['select-image', 'reload-images', 'toggle-performance-stats', 'update:searchQuery'],
  setup(props) {
    const expandedDatasets = ref([])
    const thumbnailCache = {}

    const groupedImages = computed(() => {
      if (!Array.isArray(props.images)) {
        return {}
      }
      const groups = {}
      props.images.forEach(image => {
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
      if (!props.searchQuery.trim()) {
        return groupedImages.value
      }
      const filtered = {}
      const query = props.searchQuery.toLowerCase()
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

    const toggleDataset = (datasetName) => {
      const index = expandedDatasets.value.indexOf(datasetName)
      if (index > -1) {
        expandedDatasets.value.splice(index, 1)
      } else {
        expandedDatasets.value.push(datasetName)
      }
    }

    const getThumbnailUrl = (imageId) => {
      if (thumbnailCache[imageId]) {
        return thumbnailCache[imageId]
      }
      const placeholder = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIHZpZXdCb3g9IjAgMCA0OCA0OCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQ4IiBoZWlnaHQ9IjQ4IiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yNCAzMkMzMC42Mjc0IDMyIDM2IDE5LjI1NDggMzYgM0MzNiAxMy4yNTQ4IDMwLjYyNzQgMjIgMjQgMjJDMTcuMzcyNiAyMiAxMiAxMy4yNTQ4IDEyIDNDMTIgMTkuMjU0OCAxNy4zNzI2IDMyIDI0IDMyWiIgZmlsbD0iIzlDQTNBRiIvPgo8L3N2Zz4K'
      ImageCatalogAPI.getThumbnailUrl(imageId)
        .then(url => {
          thumbnailCache[imageId] = url
          document.querySelectorAll(`img[data-image-id="${imageId}"]`).forEach(img => {
            if (img.src.startsWith('data:')) {
              img.src = url
            }
          })
        })
        .catch(err => {
          console.error('Failed to load thumbnail:', err)
        })
      return placeholder
    }

    const handleImageError = (event) => {
      event.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIHZpZXdCb3g9IjAgMCA0OCA0OCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQ4IiBoZWlnaHQ9IjQ4IiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yNCAzMkMzMC42Mjc0IDMyIDM2IDE5LjI1NDggMzYgM0MzNiAxMy4yNTQ4IDMwLjYyNzQgMjIgMjQgMjJDMTcuMzcyNiAyMiAxMiAxMy4yNTQ4IDEyIDNDMTIgMTkuMjU0OCAxNy4zNzI2IDMyIDI0IDMyWiIgZmlsbD0iIzlDQTNBRiIvPgo8L3N2Zz4K'
    }

    return {
      expandedDatasets,
      groupedImages,
      filteredGroupedImages,
      toggleDataset,
      getThumbnailUrl,
      handleImageError
    }
  }
}
</script>

<style scoped>
.sidebar{width:20rem;background-color:#fff;border-right:1px solid #e5e7eb;display:flex;flex-direction:column}.sidebar-header{padding:1rem;border-bottom:1px solid #e5e7eb}.header-content{display:flex;justify-content:space-between;align-items:center}.header-title{font-size:1.125rem;font-weight:600;color:#1f2937;line-height:1.75rem}.header-subtitle{font-size:.875rem;color:#4b5563;line-height:1.25rem}.stats-toggle-btn{font-size:.75rem;background-color:#dbeafe;color:#2563eb;padding:.25rem .5rem;border-radius:.375rem;border:none;cursor:pointer;line-height:1rem}.stats-toggle-btn:hover{background-color:#bfdbfe}.search-container{padding:1rem;border-bottom:1px solid #e5e7eb}.search-wrapper{position:relative}.search-input{width:100%;padding-left:2.5rem;padding-right:1rem;padding-top:.5rem;padding-bottom:.5rem;border:1px solid #d1d5db;border-radius:.5rem;outline:none}.search-input:focus{border-color:transparent;box-shadow:0 0 0 2px #3b82f6}.search-icon{position:absolute;left:.75rem;top:.625rem;height:1.25rem;width:1.25rem;color:#9ca3af}.dataset-tree{flex:1;overflow-y:auto}.tree-content{padding:1rem}.dataset-group{margin-bottom:1rem}.loading-state,.empty-state-sidebar{text-align:center;padding:2rem 0;color:#6b7280}.spinner{animation:spin 1s linear infinite;border-radius:9999px;height:2rem;width:2rem;border-width:2px;border-color:#3b82f6;border-bottom-color:transparent;margin:0 auto}@keyframes spin{to{transform:rotate(360deg)}}.loading-text{margin-top:.5rem;font-size:.875rem;color:#4b5563;line-height:1.25rem}.error-state{text-align:center;padding:2rem 0;color:#dc2626}.retry-btn{margin-top:.5rem;padding:.5rem 1rem;background-color:#3b82f6;color:#fff;border-radius:.375rem;border:none;cursor:pointer}.retry-btn:hover{background-color:#2563eb}.dataset-header{display:flex;align-items:center;justify-content:space-between;padding:.75rem;background-color:#f3f4f6;border-radius:.5rem;cursor:pointer;transition:background-color .2s ease}.dataset-header:hover{background-color:#e5e7eb}.dataset-header-content{display:flex;align-items:center;gap:.5rem}.chevron-icon{height:1rem;width:1rem;color:#4b5563;transition:transform .2s ease}.chevron-icon.rotated{transform:rotate(90deg)}.dataset-name{font-weight:500;color:#1f2937}.image-count{font-size:.875rem;color:#6b7280;background-color:#d1d5db;padding:.25rem .5rem;border-radius:9999px;line-height:1.25rem}.images-list{margin-top:.5rem;margin-left:1rem}.image-item{display:flex;align-items:center;padding:.75rem;border-radius:.5rem;cursor:pointer;transition:background-color .2s ease,border-color .2s ease;border:1px solid transparent;margin-bottom:.25rem}.image-item:hover{background-color:#f9fafb}.image-item.selected{background-color:#dbeafe;border-color:#93c5fd}.thumbnail{flex-shrink:0;width:3rem;height:3rem;background-color:#e5e7eb;border-radius:.5rem;overflow:hidden}.thumbnail-img{width:100%;height:100%;object-fit:cover}.image-info{margin-left:.75rem;flex:1;min-width:0}.image-name{font-size:.875rem;font-weight:500;color:#111827;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;line-height:1.25rem}.image-organ{font-size:.75rem;color:#6b7280;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;line-height:1rem}.image-id{font-size:.75rem;color:#9ca3af;line-height:1rem}.selected-info{padding:1rem;border-top:1px solid #e5e7eb;background-color:#f9fafb}.selected-title{font-size:.875rem;font-weight:500;color:#1f2937;margin-bottom:.5rem;line-height:1.25rem}.selected-details{font-size:.75rem;color:#4b5563;line-height:1rem}.selected-details p{margin-bottom:.25rem}.detail-label{font-weight:500}.dataset-tree::-webkit-scrollbar{width:6px}.dataset-tree::-webkit-scrollbar-track{background:#f1f1f1}.dataset-tree::-webkit-scrollbar-thumb{background:#c1c1c1;border-radius:3px}.dataset-tree::-webkit-scrollbar-thumb:hover{background:#a1a1a1}
</style>
