<template>
  <div class="flex-shrink-0 w-12 h-12 bg-gray-200 rounded-lg overflow-hidden">
    <img
      v-if="thumbnailUrl"
      :src="thumbnailUrl"
      :alt="alt"
      class="w-full h-full object-cover"
      @error="handleError"
      loading="lazy"
    >
    <div v-else class="w-full h-full bg-gray-300 animate-pulse flex items-center justify-center">
      <svg class="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
        <path fill-rule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clip-rule="evenodd" />
      </svg>
    </div>
  </div>
</template>

<script setup>
defineOptions({ name: 'SharedThumbnail' })
import { ref, onMounted } from 'vue'
import ImageCatalogAPI from '@/api/image_catalog.js'

const props = defineProps({
  imageId: {
    type: String,
    required: true
  },
  alt: {
    type: String,
    default: ''
  }
})

const thumbnailUrl = ref(null)

const loadThumbnail = async () => {
  try {
    const url = await ImageCatalogAPI.getThumbnailUrl(props.imageId)
    thumbnailUrl.value = url
  } catch (error) {
    console.error('Failed to load thumbnail:', error)
    handleError()
  }
}

const handleError = () => {
  thumbnailUrl.value = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIHZpZXdCb3g9IjAgMCA0OCA0OCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQ4IiBoZWlnaHQ9IjQ4IiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yNCAzMkMzMC42Mjc0IDMyIDM2IDE5LjI1NDggMzYgM0MzNiAxMy4yNTQ4IDMwLjYyNzQgMjIgMjQgMjJDMTcuMzcyNiAyMiAxMiAxMy4yNTQ4IDEyIDNDMTIgMTkuMjU0OCAxNy4zNzI2IDMyIDI0IDMyWiIgZmlsbD0iIzlDQTNBRiIvPgo8L3N2Zz4K'
}

onMounted(() => {
  loadThumbnail()
})
</script>
