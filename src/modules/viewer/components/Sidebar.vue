<template>
  <div class="sidebar">
    <div class="sidebar-header">
      <div class="header-content">
        <h2 class="header-title">Görüntü Kataloğu</h2>
      </div>
    </div>

    <div class="search-container">
      <div class="relative">
        <input
          :value="searchQuery"
          @input="$emit('update:searchQuery', $event.target.value)"
          type="text"
          placeholder="Görüntüleri ara..."
          class="form-input pl-10 pr-4 py-2"
        >
        <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
          </svg>
        </div>
      </div>
    </div>

    <div class="dataset-tree">
      <div class="tree-content">
        <div v-if="loading" class="loading-state">
          <div class="spinner"></div>
          <p class="loading-text">Görüntüler yükleniyor...</p>
        </div>

        <div v-else-if="error" class="error-state">
          <p>{{ error }}</p>
          <button @click="$emit('reload-images')" class="btn btn-primary btn-sm mt-2">
            Tekrar Dene
          </button>
        </div>

        <div v-else-if="!images || images.length === 0" class="empty-state-sidebar">
          <p>Katalogda görüntü bulunamadı.</p>
        </div>

        <div v-else>
          <div v-for="(datasetImages, datasetName) in filteredGroupedImages" :key="datasetName" class="dataset-group">
            <div
              @click="toggleDataset(datasetName)"
              class="dataset-header group"
            >
              <div class="dataset-header-content">
                <svg
                  :class="['chevron-icon', { 'rotated': expandedDatasets.includes(datasetName) }]"
                  fill="none" stroke="currentColor" viewBox="0 0 24 24"
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
                    {{ image.organ_type || 'Bilinmiyor' }}
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
      <h3 class="selected-title">Seçili Görüntü</h3>
      <div class="selected-details">
        <p><span class="detail-label">İsim:</span> {{ selectedImage.file_name || 'N/A' }}</p>
        <p><span class="detail-label">Veri Seti:</span> {{ selectedImage.dataset_name }}</p>
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
  props: { images: { type: Array, default: () => [] }, selectedImage: { type: Object, default: null }, searchQuery: { type: String, default: '' }, loading: { type: Boolean, default: false }, error: { type: String, default: null } },
  emits: ['select-image', 'reload-images', 'toggle-performance-stats', 'update:searchQuery'],
  setup(props) {
    const expandedDatasets = ref([]);
    const thumbnailCache = {};
    const groupedImages = computed(() => { if (!Array.isArray(props.images)) return {}; const groups = {}; props.images.forEach(image => { const dataset = image.dataset_name || 'Unknown'; if (!groups[dataset]) groups[dataset] = []; groups[dataset].push(image); }); Object.keys(groups).forEach(dataset => { groups[dataset].sort((a, b) => (a.file_name || a.id).localeCompare(b.file_name || b.id)); }); return groups; });
    const filteredGroupedImages = computed(() => { if (!props.searchQuery.trim()) return groupedImages.value; const filtered = {}; const query = props.searchQuery.toLowerCase(); Object.keys(groupedImages.value).forEach(dataset => { const filteredImages = groupedImages.value[dataset].filter(image => (image.file_name || '').toLowerCase().includes(query) || (image.id || '').toLowerCase().includes(query) || (image.organ_type || '').toLowerCase().includes(query) || dataset.toLowerCase().includes(query)); if (filteredImages.length > 0) filtered[dataset] = filteredImages; }); return filtered; });
    const toggleDataset = (datasetName) => { const index = expandedDatasets.value.indexOf(datasetName); if (index > -1) expandedDatasets.value.splice(index, 1); else expandedDatasets.value.push(datasetName); };
    const getThumbnailUrl = (imageId) => { if (thumbnailCache[imageId]) return thumbnailCache[imageId]; const placeholder = 'data:image/svg+xml;base64,...'; ImageCatalogAPI.getThumbnailUrl(imageId).then(url => { thumbnailCache[imageId] = url; document.querySelectorAll(`img[data-image-id="${imageId}"]`).forEach(img => { if (img.src.startsWith('data:')) img.src = url; }); }).catch(err => console.error('Failed to load thumbnail:', err)); return placeholder; };
    const handleImageError = (event) => { event.target.src = 'data:image/svg+xml;base64,...'; };
    return { expandedDatasets, groupedImages, filteredGroupedImages, toggleDataset, getThumbnailUrl, handleImageError };
  }
}
</script>

<style scoped>

.sidebar {
  @apply w-64 bg-white border-r border-gray-200 flex flex-col flex-shrink-0; /* Genişlik azaltıldı */
}
.sidebar-header {
  @apply p-4 border-b border-gray-200; /* Padding ayarlandı */
}
.header-content {
  @apply flex justify-between items-center;
}
.header-title {
  @apply text-lg font-semibold text-gray-800; /* Renk ve boyut ayarlandı */
}
.search-container {
  @apply p-3 border-b border-gray-200; /* Padding ayarlandı */
}
.dataset-tree {
  @apply flex-1 overflow-y-auto;
}
.tree-content {
  @apply p-3; /* Padding ayarlandı */
}
.loading-state, .empty-state-sidebar {
  @apply text-center py-8 text-gray-500 text-sm; /* Boyut ve padding ayarlandı */
}
.spinner { /* Tailwind spin animasyonu kullanılabilir veya bu bırakılabilir */
  @apply animate-spin rounded-full h-6 w-6 border-2 border-blue-500 border-b-transparent mx-auto mb-2;
}
.error-state {
  @apply text-center py-8 text-red-600 text-sm;
}
.dataset-group {
  @apply mb-3;
}
.dataset-header {
  @apply flex items-center justify-between p-2 bg-gray-100 rounded cursor-pointer transition-colors duration-150 group-hover:bg-gray-200;
}
.dataset-header-content {
  @apply flex items-center gap-2;
}
.chevron-icon {
  @apply h-4 w-4 text-gray-500 transition-transform duration-200 ease-in-out;
}
.chevron-icon.rotated {
  @apply rotate-90;
}
.dataset-name {
  @apply font-medium text-sm text-gray-700;
}
.image-count {
  @apply text-xs text-gray-500 bg-gray-200 px-1.5 py-0.5 rounded-full;
}
.images-list {
  @apply mt-1 pl-4 border-l border-gray-200 ml-2; /* İçeri girinti ve çizgi */
}
.image-item {
  @apply flex items-center p-1.5 rounded cursor-pointer border border-transparent mb-1 transition-colors duration-150 hover:bg-gray-50;
}
.image-item.selected {
  @apply bg-indigo-50 border-indigo-200;
}
.thumbnail {
  @apply flex-shrink-0 w-10 h-10 bg-gray-200 rounded overflow-hidden; /* Boyut ayarlandı */
}
.thumbnail-img {
  @apply w-full h-full object-cover;
}
.image-info {
  @apply ml-2 flex-1 min-w-0;
}
.image-name {
  @apply text-sm font-medium text-gray-800 truncate;
}
.image-organ, .image-id {
  @apply text-xs text-gray-500 truncate;
}
.selected-info {
  @apply p-3 border-t border-gray-200 bg-gray-50 text-xs; /* Boyut ayarlandı */
}
.selected-title {
  @apply font-semibold text-gray-700 mb-1;
}
.selected-details p {
  @apply mb-0.5 text-gray-600;
}
.detail-label {
  @apply font-medium text-gray-800 mr-1;
}
</style>
