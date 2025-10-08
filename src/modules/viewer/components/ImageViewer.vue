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
    />
    <div class="main-viewer">
      <div class="toolbar">
        <div class="toolbar-left">
          <span class="toolbar-title">HistopathAI</span>
          <div v-if="selectedImage" class="toolbar-info">
            Loading: {{ selectedImage.file_name }}
          </div>
        </div>
        <div class="toolbar-right">
          <span>Session: {{ sessionStatus }}</span>
          <button @click="refreshSession" class="refresh-btn" title="Refresh session">🔄</button>
        </div>
      </div>
      <AnnotationsTool
        v-model:organ="annotationData.organ"
        v-model:diagnosis="annotationData.diagnosis"
        v-model:grade="annotationData.grade"
        v-model:gender="annotationData.gender"
        v-model:age="annotationData.age"
      />
      <div class="viewer-wrapper">
         <ViewerToolbar
          :active-tool="activeTool"
          :test-disabled="!isSaved"
          @select-tool="handleToolSelected"
          @undo="handleUndo"
          @clear="handleClear"
          @save="handleSave"
          @previous-image="handlePrevious"
          @next-image="handleNext"
          @test-coordinates="handleTestCoordinates"
        />
        <div ref="viewerContainer" class="osd-container"></div>
        <div v-if="!selectedImage && !viewerLoading" class="overlay empty-state">
            <div class="empty-content">
              <svg class="empty-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
              <h3 class="empty-title">Select an image to view</h3>
              <p class="empty-subtitle">Choose an image from the sidebar to start viewing</p>
            </div>
        </div>
        <div v-if="viewerLoading" class="overlay loading-overlay">
            <div class="loading-content">
              <div class="spinner-large"></div>
              <p class="loading-title">Loading tiles...</p>
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
import AnnotationsTool from './AnnotationsTool.vue';
import ViewerToolbar from './ViewerToolbar.vue';
import { useToast } from 'vue-toastification';

const toast = useToast();

const images = ref([]);
const selectedImage = ref(null);
const searchQuery = ref('');
const loading = ref(false);
const error = ref(null);
const viewerLoading = ref(false);
const sessionStatus = ref('Not created');
const viewerContainer = ref(null);
const activeTool = ref('pan');
const annotationData = reactive({ organ: '', diagnosis: '', grade: '', gender: '', age: null });
const isSaved = ref(false);

let viewer = null;
let anno = null;
let lastCreatedAnnotation = null;

const groupedImages = computed(() => {
  if (!Array.isArray(images.value)) return {};
  const groups = {};
  images.value.forEach(image => {
    const dataset = image.dataset_name || 'Unknown';
    if (!groups[dataset]) groups[dataset] = [];
    groups[dataset].push(image);
  });

  return Object.keys(groups)
    .sort()
    .reduce((obj, key) => {
      obj[key] = groups[key].sort((a, b) => (a.file_name || '').localeCompare(b.file_name || ''));
      return obj;
    }, {});
});

const handleToolSelected = (tool) => {
  activeTool.value = tool;
  if (!anno) return;
  anno.setDrawingEnabled(tool === 'polygon');
  if (tool === 'polygon') {
    anno.setDrawingTool('polygon');
  }
};

const handleUndo = () => {
  if (lastCreatedAnnotation) {
    anno.removeAnnotation(lastCreatedAnnotation);
    lastCreatedAnnotation = null;
    isSaved.value = false;
    toast.info('Son etiket geri alındı.');
  } else {
    toast.warning('Geri alınacak bir etiket bulunamadı.');
  }
};

const handleClear = () => {
  if (confirm('Tüm etiketleri ve test noktalarını temizlemek istediğinizden emin misiniz?')) {
    if (anno) anno.clearAnnotations();
    viewer.clearOverlays();
    isSaved.value = false;
  }
};

const handleSave = () => {
  if (!selectedImage.value || !anno) return;
  const allAnnotations = anno.getAnnotations();
  if (allAnnotations.length === 0) return toast.info('Kaydedilecek etiket bulunamadı.');

  const cleanedAnnotations = allAnnotations.map(a => { const { ...clone } = a; delete clone.id; return clone; });
  const dataToSave = { image_id: selectedImage.value.id, file_name: selectedImage.value.file_name, metadata: { ...annotationData }, annotations: cleanedAnnotations };
  const dataStr = JSON.stringify(dataToSave, null, 2);
  const blob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  const fileName = selectedImage.value.file_name ? `${selectedImage.value.file_name.split('.')[0]}_annotations.json` : 'annotations.json';
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  isSaved.value = true;
  toast.success(`Etiketler "${fileName}" olarak indirildi!`);
};

// --- HATA AYIKLAMA İÇİN GÜNCELLENMİŞ TEST FONKSİYONU ---
const handleTestCoordinates = () => {
  if (!isSaved.value) {
    return toast.warning('Koordinatları test etmek için önce etiketleri kaydetmelisiniz.');
  }
  const allAnnotations = anno.getAnnotations();
  if (allAnnotations.length === 0) return toast.info('Test edilecek etiket bulunamadı.');

  viewer.clearOverlays();
  toast.info(`Koordinatlar test ediliyor... (Detaylar için konsolu inceleyin)`);

  let pointsFound = 0;
  allAnnotations.forEach((annotation, index) => {
    console.log(`--- ETİKET #${index + 1} İŞLENİYOR ---`);
    try {
      const selectorValue = annotation.target.selector.value;
      const match = selectorValue.match(/points="([^"]*)"/);

      if (!match || !match[1]) {
        console.warn(`'points' verisi bulunamadı.`, annotation);
        return;
      }

      const pointsString = match[1];
      const firstPoint = pointsString.split(' ')[0];
      const [x, y] = firstPoint.split(',').map(Number);
      console.log(`Ayrıştırılan koordinatlar: x=${x}, y=${y}`);

      if (isNaN(x) || isNaN(y)) {
        console.warn(`Geçersiz koordinat verisi.`, { firstPoint });
        return;
      }

      const imagePoint = new OpenSeadragon.Point(x, y);
      console.log('OpenSeadragon.Point nesnesi oluşturuldu:', imagePoint);

      const overlayEl = document.createElement('div');
      overlayEl.className = 'debug-test-point'; // Elementi kolayca bulmak için class ekledik
      overlayEl.style.width = '24px';
      overlayEl.style.height = '24px';
      overlayEl.style.backgroundColor = '#16a34a';
      overlayEl.style.borderRadius = '50%';
      overlayEl.style.border = '2px solid white';
      overlayEl.style.opacity = '0.9';

      console.log('Overlay elementi oluşturuldu:', overlayEl);
      viewer.addOverlay({ element: overlayEl, location: imagePoint, placement: 'CENTER' });
      console.log('viewer.addOverlay çağrıldı.');
      pointsFound++;
    } catch (e) {
      console.error(`Etiket #${index + 1} işlenirken bir hata oluştu:`, e, annotation);
    }
  });

  if (pointsFound > 0) {
    toast.success(`${pointsFound} adet test noktası eklendi.`);
  } else {
    toast.error('Geçerli test noktası oluşturulamadı. Lütfen konsolu kontrol edin.');
  }
};

const getCurrentImageIndex = () => {
    if (!selectedImage.value) return -1;
    const allImages = Object.values(groupedImages.value).flat();
    return allImages.findIndex(img => img.id === selectedImage.value.id);
};

const handlePrevious = () => {
    const allImages = Object.values(groupedImages.value).flat();
    const currentIndex = getCurrentImageIndex();
    if (currentIndex > 0) selectImage(allImages[currentIndex - 1]);
};

const handleNext = () => {
    const allImages = Object.values(groupedImages.value).flat();
    const currentIndex = getCurrentImageIndex();
    if (currentIndex < allImages.length - 1) selectImage(allImages[currentIndex + 1]);
};

const loadImages = async (isReload = false) => {
  loading.value = true; error.value = null;
  try {
    await ImageCatalogAPI.getValidSessionId();
    const response = await ImageCatalogAPI.getImages();
    images.value = response.data?.images || (Array.isArray(response.data) ? response.data : []);
    await updateSessionStatus();
    if (!isReload && images.value.length > 0) {
      await nextTick();
      const firstDatasetName = Object.keys(groupedImages.value)[0];
      if (firstDatasetName && groupedImages.value[firstDatasetName]?.length > 0) {
        if (!selectedImage.value) selectImage(groupedImages.value[firstDatasetName][0]);
      }
    }
  } catch (err) {
    error.value = err.response?.data?.message || 'Resimler yüklenemedi.';
    images.value = [];
  } finally {
    loading.value = false;
  }
};

const updateSessionStatus = async () => {
  try {
    const { sessionValid } = await ImageCatalogAPI.getPerformanceMetrics();
    sessionStatus.value = sessionValid ? 'Active' : 'Inactive';
  } catch { sessionStatus.value = 'Error'; }
};

const refreshSession = async () => {
  await ImageCatalogAPI.createImageSession();
  await loadImages(true);
  toast.success('Oturum yenilendi.');
};

const selectImage = async (image) => {
  if (!image || selectedImage.value?.id === image.id) return;
  selectedImage.value = image;
  isSaved.value = false;
  if(viewer) viewer.clearOverlays();
  await loadImageInViewer(image);
};

const setupViewer = () => {
  if (!viewerContainer.value) return;
  viewer = OpenSeadragon({ element: viewerContainer.value, prefixUrl: '//openseadragon.github.io/openseadragon/images/', showNavigationControl: true, navigatorPosition: 'TOP_RIGHT' });

  anno = Annotorious(viewer);

  anno.on('createAnnotation', (annotation, override) => {
    lastCreatedAnnotation = annotation;
    isSaved.value = false;
    const commentValue = `Organ: ${annotationData.organ || 'N/A'}, Dx: ${annotationData.diagnosis || 'N/A'}, Grade: ${annotationData.grade || 'N/A'}, Gender: ${annotationData.gender || 'N/A'}, Age: ${annotationData.age || 'N/A'}`;
    if (!Array.isArray(annotation.body)) annotation.body = [];
    annotation.body.push({ purpose: 'commenting', value: commentValue });
    override(annotation);
  });

  viewer.addHandler('open', () => {
    viewerLoading.value = false;
    if (anno) anno.clearAnnotations();
    handleToolSelected(activeTool.value);
  });
  viewer.addHandler('open-failed', e => {
    viewerLoading.value = false;
    toast.error(`Görüntü yüklenemedi: ${e.message}.`);
    selectedImage.value = null;
  });
};

const loadImageInViewer = async (image) => {
  if (!image || !viewer) return;
  viewerLoading.value = true;
  try {
    await ImageCatalogAPI.getValidSessionId();
    const dziUrl = await ImageCatalogAPI.getDZIUrl(image.id);
    viewer.open(dziUrl);
  } catch (err) {
    viewerLoading.value = false;
    toast.error(err.response?.data?.message || 'Görüntü yüklenemedi.');
    selectedImage.value = null;
  }
};

onMounted(() => {
  setupViewer();
  loadImages();
});

onUnmounted(() => {
  if (anno) anno.destroy();
  if (viewer) viewer.destroy();
  ImageCatalogAPI.cleanup();
});
</script>
<style>
/* Global Annotorious stilleri */
.a9s-annotationlayer .a9s-selection .a9s-inner,
.a9s-annotationlayer .a9s-selection .a9s-handle {
  stroke: #ef4444 !important;
  stroke-width: 2px !important;
  fill: rgba(239, 68, 68, 0.25) !important;
}
.a9s-toolbar {
  display: none !important;
}
</style>

<style scoped>
.viewer-container{display:flex;height:100vh;background-color:#f9fafb}.main-viewer{flex:1;display:flex;flex-direction:column}.viewer-wrapper{flex:1;position:relative;overflow:hidden}.osd-container{width:100%;height:100%;background-color:#000}.overlay{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;z-index:10}.empty-state{background-color:#fff;color:#6b7280}.empty-content{text-align:center}.empty-icon{margin:0 auto;height:4rem;width:4rem;color:#d1d5db}.empty-title{margin-top:1rem;font-size:1.125rem;font-weight:500;line-height:1.75rem}.empty-subtitle{margin-top:.5rem;font-size:.875rem;color:#9ca3af;line-height:1.25rem}.loading-overlay{background-color:rgba(0,0,0,.5);z-index:20}.loading-content{text-align:center;color:#fff}.spinner-large{animation:spin 1s linear infinite;border-radius:9999px;height:3rem;width:3rem;border-width:2px;border-color:#fff;border-bottom-color:transparent;margin:0 auto}@keyframes spin{to{transform:rotate(360deg)}}.toolbar{height:3rem;background-color:#fff;border-bottom:1px solid #e5e7eb;display:flex;align-items:center;padding:0 1rem;justify-content:space-between}.toolbar-left{display:flex;align-items:center;gap:1rem}.toolbar-title{font-size:.875rem;color:#4b5563;line-height:1.25rem}.toolbar-info{font-size:.75rem;color:#6b7280;line-height:1rem}.toolbar-right{display:flex;align-items:center;gap:.5rem;font-size:.75rem;color:#6b7280;line-height:1rem}.refresh-btn{margin-left:.5rem;font-size:.75rem;background-color:#dbeafe;color:#2563eb;padding:.25rem .5rem;border-radius:.375rem;border:none;cursor:pointer;line-height:1rem}.refresh-btn:hover{background-color:#bfdbfe}
</style>
