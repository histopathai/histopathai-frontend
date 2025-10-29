<template>
  <div class="viewer-container">
    <Sidebar
      :images="images"
      :selected-image="selectedImage"
      :search-query="searchQuery"
      :loading="loading"
      :error="error"
      @select-image="selectImage"
      @reload-images="loadImages"
      v-model:searchQuery="searchQuery"
      @toggle-performance-stats="() => {}"
    />
    <div class="main-viewer">
      <div class="toolbar">
        <div class="toolbar-left">
          <div v-if="selectedImage" class="toolbar-info">
            Dosya: {{ selectedImage.file_name }}
            <span class="mx-2 text-gray-300">|</span>
            ID: {{ selectedImage.id }}
          </div>
          <div v-else class="toolbar-info">&nbsp;</div>
        </div>

        <div class="toolbar-right">
          <AnnotationsTool
            v-model:organ="annotationData.organ"
            v-model:diagnosis="annotationData.diagnosis"
            v-model:grade="annotationData.grade"
            v-model:gender="annotationData.gender"
            v-model:age="annotationData.age"
          />
        </div>
      </div>

      <div class="viewer-wrapper">
         <ViewerToolbar
          :active-tool="activeTool"
          @select-tool="handleToolSelected"
          @undo="handleUndo"
          @clear="handleClear"
          @save="handleSave"
          @previous-image="handlePrevious"
          @next-image="handleNext"
        />
        <div ref="viewerContainer" class="osd-container"></div>
        <div v-if="hoveredAnnotation" class="info-box" :style="hoverStyle">
          <div class="info-color-swatch" :style="{ backgroundColor: hoveredAnnotation.color }"></div>
          <p>{{ hoveredAnnotation.text }}</p>
        </div>
        <div v-if="!selectedImage && !viewerLoading" class="overlay empty-state">
            <div class="empty-content">
              <h3 class="empty-title">Görüntülemek için bir resim seçin</h3>
              <p class="empty-subtitle">Başlamak için kenar çubuğundan bir resim seçin</p>
            </div>
        </div>
        <div v-if="viewerLoading" class="overlay loading-overlay">
            <div class="loading-content">
              <div class="spinner-large"></div>
              <p class="loading-title">Döşemeler yükleniyor...</p>
            </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted, computed, nextTick } from 'vue';
import OpenSeadragon from 'openseadragon';
import Annotorious from '@recogito/annotorious-openseadragon';
import '@recogito/annotorious-openseadragon/dist/annotorious.min.css';
import ImageCatalogAPI from '@/api/image_catalog.js';
import Sidebar from './Sidebar.vue';
import AnnotationsTool from './AnnotationsTool.vue'; // <-- Bu hala burada, kaldırmadık
import ViewerToolbar from './ViewerToolbar.vue';
import { useToast } from 'vue-toastification';

const toast = useToast();
const images = ref([]);
const selectedImage = ref(null);
const searchQuery = ref('');
const loading = ref(false);
const error = ref(null);
const viewerLoading = ref(false);
const viewerContainer = ref(null);
const activeTool = ref('pan');
const annotationData = reactive({ organ: '', diagnosis: '', grade: '', gender: '', age: null });
const hoveredAnnotation = ref(null);
let viewer = null;
let anno = null;
let lastCreatedAnnotation = null;

const hoverStyle = computed(() => { if (!hoveredAnnotation.value) return {}; return { top: hoveredAnnotation.value.top, left: hoveredAnnotation.value.left }; });
const groupedImages = computed(() => { if (!Array.isArray(images.value)) return {}; const groups = {}; images.value.forEach(image => { const dataset = image.dataset_name || 'Unknown'; if (!groups[dataset]) groups[dataset] = []; groups[dataset].push(image); }); return Object.keys(groups).sort().reduce((obj, key) => { obj[key] = groups[key].sort((a, b) => (a.file_name || '').localeCompare(b.file_name || '')); return obj; }, {}); });
const handleToolSelected = (tool) => { activeTool.value = tool; if (!anno) return; anno.setDrawingEnabled(tool === 'polygon'); if (tool === 'polygon') anno.setDrawingTool('polygon'); };
const handleUndo = () => { if (lastCreatedAnnotation) { anno.removeAnnotation(lastCreatedAnnotation); lastCreatedAnnotation = null; toast.info('Son etiket geri alındı.'); } else { toast.warning('Geri alınacak bir etiket bulunamadı.'); } };
const handleClear = () => { if (confirm('Tüm etiketleri temizlemek istediğinizden emin misiniz?')) { if (anno) anno.clearAnnotations(); } };
const handleSave = () => { if (!selectedImage.value || !anno) return toast.info('Kaydedilecek bir resim bulunamadı.'); const allAnnotations = anno.getAnnotations(); if (allAnnotations.length === 0) return toast.info('Kaydedilecek etiket bulunamadı.'); const cleanedAnnotations = allAnnotations.map(a => { const { ...clone } = a; delete clone.id; return clone; }); const dataToSave = { image_id: selectedImage.value.id, file_name: selectedImage.value.file_name, metadata: { ...annotationData }, annotations: cleanedAnnotations }; const dataStr = JSON.stringify(dataToSave, null, 2); const blob = new Blob([dataStr], { type: 'application/json' }); const url = URL.createObjectURL(blob); const link = document.createElement('a'); link.href = url; const fileName = selectedImage.value.file_name ? `${selectedImage.value.file_name.split('.')[0]}_annotations.json` : 'annotations.json'; link.download = fileName; document.body.appendChild(link); link.click(); document.body.removeChild(link); URL.revokeObjectURL(url); toast.success(`Etiketler "${fileName}" olarak indirildi!`); };
const getCurrentImageIndex = () => { if (!selectedImage.value) return -1; const allImages = Object.values(groupedImages.value).flat(); return allImages.findIndex(img => img.id === selectedImage.value.id); };
const handlePrevious = () => { const allImages = Object.values(groupedImages.value).flat(); const currentIndex = getCurrentImageIndex(); if (currentIndex > 0) selectImage(allImages[currentIndex - 1]); };
const handleNext = () => { const allImages = Object.values(groupedImages.value).flat(); const currentIndex = getCurrentImageIndex(); if (currentIndex < allImages.length - 1) selectImage(allImages[currentIndex + 1]); };
const loadImages = async (isReload = false) => { loading.value = true; error.value = null; try { const response = await ImageCatalogAPI.getImages(); images.value = response.data?.images || (Array.isArray(response.data) ? response.data : []); if (!isReload && images.value.length > 0) { await nextTick(); const firstDatasetName = Object.keys(groupedImages.value)[0]; if (firstDatasetName && groupedImages.value[firstDatasetName]?.length > 0) { if (!selectedImage.value) selectImage(groupedImages.value[firstDatasetName][0]); } } } catch (err) { error.value = err.response?.data?.message || 'Resimler yüklenemedi.'; images.value = []; } finally { loading.value = false; } };
const selectImage = async (image) => { if (!image || selectedImage.value?.id === image.id) return; selectedImage.value = image; annotationData.organ = image.organ_type || ''; annotationData.diagnosis = image.disease_type || ''; annotationData.grade = image.grade || ''; annotationData.gender = image.gender || ''; annotationData.age = image.age || null; await loadImageInViewer(image); };
const setupViewer = () => { if (!viewerContainer.value) return; viewer = OpenSeadragon({ element: viewerContainer.value, prefixUrl: '//openseadragon.github.io/openseadragon/images/', showNavigationControl: true, navigatorPosition: 'TOP_RIGHT' }); anno = Annotorious(viewer); anno.on('createAnnotation', (annotation, override) => { lastCreatedAnnotation = annotation; const commentValue = `Organ: ${annotationData.organ || 'N/A'}, Dx: ${annotationData.diagnosis || 'N/A'}, Grade: ${annotationData.grade || 'N/A'}, Gender: ${annotationData.gender || 'N/A'}, Age: ${annotationData.age || 'N/A'}`; if (!Array.isArray(annotation.body)) annotation.body = []; annotation.body.push({ purpose: 'commenting', value: commentValue }); override(annotation); }); anno.on('mouseEnterAnnotation', (annotation, event) => { const text = annotation.body.find(b => b.purpose === 'commenting')?.value || 'Veri Yok'; hoveredAnnotation.value = { text: text, color: annotation.drawingStyle?.stroke || '#FFFFFF', top: `${event.clientY + 15}px`, left: `${event.clientX + 15}px` }; }); anno.on('mouseLeaveAnnotation', () => { hoveredAnnotation.value = null; }); viewer.addHandler('open', () => { viewerLoading.value = false; if (anno) anno.clearAnnotations(); handleToolSelected(activeTool.value); }); viewer.addHandler('open-failed', e => { viewerLoading.value = false; toast.error(`Görüntü yüklenemedi: ${e.message}.`); selectedImage.value = null; }); };
const loadImageInViewer = async (image) => { if (!image || !viewer) return; viewerLoading.value = true; try { const dziUrl = await ImageCatalogAPI.getDZIUrl(image.id); viewer.open(dziUrl); } catch (err) { viewerLoading.value = false; toast.error(err.response?.data?.message || 'Görüntü yüklenemedi.'); selectedImage.value = null; } };
onMounted(() => { setupViewer(); loadImages(); });
onUnmounted(() => { if (anno) anno.destroy(); if (viewer) viewer.destroy(); });
</script>

<style scoped>
.info-box { @apply fixed bg-black bg-opacity-80 text-white px-3 py-2 rounded-md text-xs z-[10000] pointer-events-none flex items-center gap-2 whitespace-pre-wrap max-w-xs; }
.info-color-swatch { @apply w-3 h-3 rounded-full border border-white flex-shrink-0; }

/* DEĞİŞİKLİK: .viewer-container'da h-full/h-screen yerine flex-1 kullanılıyor.
  Bu, DashboardLayout'taki flex ebeveynini tam olarak doldurmasını sağlar.
*/
.viewer-container { @apply flex flex-1 bg-gray-100; }
.main-viewer { @apply flex-1 flex flex-col; }
.viewer-wrapper { @apply flex-1 relative overflow-hidden; }
.osd-container { @apply w-full h-full bg-black; }
.overlay { @apply absolute inset-0 flex items-center justify-center z-10; }
.empty-state { @apply bg-gray-50 text-gray-500; }
.empty-content { @apply text-center; }
.empty-icon { @apply mx-auto h-16 w-16 text-gray-400; }
.empty-title { @apply mt-2 text-lg font-medium text-gray-700; }
.empty-subtitle { @apply mt-1 text-sm text-gray-500; }
.loading-overlay { @apply bg-black bg-opacity-60 z-20; }
.loading-content { @apply text-center text-white; }
.spinner-large { @apply animate-spin rounded-full h-12 w-12 border-4 border-white border-b-transparent mx-auto mb-3; }
.loading-title { @apply text-base font-medium; }
.toolbar { @apply bg-white border-b border-gray-200 flex items-center px-4 py-2 flex-shrink-0 justify-between; }
.toolbar-left { @apply flex items-center gap-4 min-h-[1.25rem] flex-shrink-0; }
.toolbar-info { @apply text-xs text-gray-500; }
.toolbar-right { @apply flex-1 min-w-0; }
</style>
