<template>
  <TransitionRoot as="template" :show="isOpen">
    <Dialog as="div" class="relative z-10" @close="!loading && closeModal()">
      <div class="fixed inset-0 z-10 overflow-y-auto">
        <div class="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <DialogPanel class="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">

              <div v-if="isCameraView" class="absolute inset-0 z-20 bg-black flex flex-col items-center justify-center">
                <video ref="videoEl" class="w-full h-full object-cover" autoplay playsinline></video>
                <div class="absolute bottom-0 left-0 right-0 p-4 flex justify-center items-center gap-4 bg-black bg-opacity-50">
                  <button @click="stopCamera(true)" type="button" class="btn btn-outline text-white border-white">Geri</button>
                  <button @click="captureImage" type="button" class="p-4 bg-white rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                    <svg class="w-8 h-8 text-blue-600" fill="currentColor" viewBox="0 0 20 20"><path d="M10 12a2 2 0 100-4 2 2 0 000 4z"></path><path fill-rule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.022 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clip-rule="evenodd"></path></svg>
                  </button>
                  <div class="w-24"></div>
                </div>
                <canvas ref="canvasEl" class="hidden"></canvas>
              </div>

              <form @submit.prevent="handleUpload">
                <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <DialogTitle as="h3" class="text-lg font-medium leading-6 text-gray-900">
                    '{{ workspaceName }}' Alanına Görüntü Yükle
                  </DialogTitle>
                  <div class="mt-4 space-y-4">
                    <div>
                      <label class="form-label">Görüntü Dosyası *</label>
                      <div class="mt-2 flex items-center gap-4">
                        <div class="w-24 h-24 bg-gray-100 rounded-md flex items-center justify-center">
                          <img v-if="fileBlobUrl" :src="fileBlobUrl" class="w-full h-full object-cover rounded-md" alt="Önizleme">
                          <svg v-else class="w-12 h-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                        </div>
                        <div class="flex flex-col gap-2">
                          <button @click="triggerFileInput" type="button" class="btn btn-outline">Galeriden Seç</button>
                          <button @click="startCamera" type="button" class="btn btn-outline">Kameradan Çek</button>
                        </div>
                      </div>
                      <input id="file-upload" ref="fileInputEl" name="file-upload" type="file" @change="onFileChange" class="hidden" accept="image/png, image/jpeg, image/tiff">
                    </div>
                     <div><label class="form-label">Teşhis</label><input type="text" v-model="metadata.disease_type" class="form-input" placeholder="Örn: Carcinoma"></div>
                     <div><label class="form-label">Tip</label><input type="text" v-model="metadata.sub_type" class="form-input" placeholder="Örn: Invasive"></div>
                     <div><label class="form-label">Grade</label><input type="text" v-model="metadata.grade" class="form-input"></div>
                    <div class="grid grid-cols-2 gap-4">
                      <div><label class="form-label">Yaş</label><input type="number" v-model="metadata.age" class="form-input" placeholder="Örn: 65"></div>
                      <div><label for="gender-select" class="form-label">Cinsiyet</label><select id="gender-select" v-model="metadata.gender" class="form-input"><option value="" disabled>Lütfen bir seçenek belirleyin...</option><option value="Erkek">Erkek</option><option value="Kadın">Kadın</option><option value="Belirtmek istemiyor">Belirtmek istemiyor</option></select></div>
                    </div>
                    <div><label class="form-label">Irk</label><input type="text" v-model="metadata.race" class="form-input" placeholder="Örn: Kafkas"></div>
                  </div>
                   <p v-if="error" class="text-red-500 text-sm mt-2">{{ error }}</p>
                </div>
                <div class="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                  <button type="submit" class="btn btn-primary sm:ml-3 sm:w-auto" :disabled="loading">
                    {{ loading ? 'Yükleniyor...' : 'Yükle ve İşle' }}
                  </button>
                  <button type="button" class="btn btn-outline mt-3 sm:mt-0 sm:w-auto" @click="closeModal" :disabled="loading">İptal</button>
                </div>
              </form>
            </DialogPanel>
        </div>
      </div>
    </Dialog>
  </TransitionRoot>
</template>

<script setup>
import { ref, reactive, watch } from 'vue';
import { Dialog, DialogPanel, DialogTitle, TransitionRoot } from '@headlessui/vue';
import { useToast } from 'vue-toastification';

const props = defineProps({ isOpen: Boolean, workspaceName: String, organType: String });
const emit = defineEmits(['close', 'uploaded']);
const toast = useToast();
const file = ref(null);
const fileBlobUrl = ref(null);
const metadata = reactive({ dataset_name: '', organ_type: '', disease_type: '', classification: '', sub_type: '', grade: '', age: '', gender: '', race: '' });
const loading = ref(false);
const error = ref('');
const isCameraView = ref(false);
const videoEl = ref(null);
const canvasEl = ref(null);
const fileInputEl = ref(null);

watch(() => props.isOpen, (newVal) => { if (newVal) { metadata.dataset_name = props.workspaceName; metadata.organ_type = props.organType; } else { resetForm(); stopCamera(false); } });
const onFileChange = (e) => { const selectedFile = e.target.files[0]; if (!selectedFile) { file.value = null; return; } file.value = selectedFile; if (fileBlobUrl.value) URL.revokeObjectURL(fileBlobUrl.value); fileBlobUrl.value = URL.createObjectURL(selectedFile); error.value = ''; };
const handleUpload = async () => { if (!file.value) { error.value = "Lütfen bir görüntü dosyası seçin veya çekin."; return; } loading.value = true; error.value = ''; const fakeImageData = { ...metadata, id: `fake-${Date.now()}`, file_name: file.value.name, blobUrl: fileBlobUrl.value, imageType: 'simple' }; setTimeout(() => { emit('uploaded', fakeImageData); file.value = null; fileBlobUrl.value = null; loading.value = false; }, 1000); };
const resetForm = () => { if (fileBlobUrl.value) URL.revokeObjectURL(fileBlobUrl.value); fileBlobUrl.value = null; file.value = null; if(fileInputEl.value) fileInputEl.value.value = null; Object.keys(metadata).forEach(key => { if(key !== 'dataset_name' && key !== 'organ_type') metadata[key] = ''; }); };
const triggerFileInput = () => { fileInputEl.value.click(); };

// GÜNCELLENDİ: startCamera fonksiyonu
const startCamera = async () => {
  // Önce kamera arayüzünü aç
  isCameraView.value = true;
  try {
    // MediaDevices'e erişmeyi dene
    const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
    // Başarılı olursa video elementine stream'i bağla
    videoEl.value.srcObject = stream;
  } catch (err) {
    // BAŞARISIZ OLURSA:
    // 1. Hatayı göster
    toast.error("Kameraya erişilemedi. Lütfen izinleri kontrol edin.");
    console.error("Kamera Hatası:", err);
    // 2. Açılan siyah arayüzü hemen kapat
    isCameraView.value = false;
  }
};

const stopCamera = (fromButton = false) => { if (videoEl.value && videoEl.value.srcObject) { videoEl.value.srcObject.getTracks().forEach(track => track.stop()); videoEl.value.srcObject = null; } if(fromButton) { isCameraView.value = false; } };
const captureImage = () => { const video = videoEl.value; const canvas = canvasEl.value; if (!video || !canvas) return; canvas.width = video.videoWidth; canvas.height = video.videoHeight; canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height); canvas.toBlob((blob) => { const fileName = `capture-${Date.now()}.jpg`; const capturedFile = new File([blob], fileName, { type: 'image/jpeg' }); file.value = capturedFile; if (fileBlobUrl.value) URL.revokeObjectURL(fileBlobUrl.value); fileBlobUrl.value = URL.createObjectURL(capturedFile); error.value = ''; stopCamera(true); }, 'image/jpeg'); };
const closeModal = () => { stopCamera(false); emit('close'); };
</script>
