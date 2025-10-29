<template>
  <TransitionRoot as="template" :show="isOpen">
    <Dialog as="div" class="relative z-10" @close="!loading && closeModal()">
      <TransitionChild as="template" enter="ease-out duration-300" enter-from="opacity-0" enter-to="opacity-100" leave="ease-in duration-200" leave-from="opacity-100" leave-to="opacity-0">
        <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
      </TransitionChild>

      <div class="fixed inset-0 z-10 overflow-y-auto">
        <div
          class="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0"
        >
          <TransitionChild as="template" enter="ease-out duration-300" enter-from="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95" enter-to="opacity-100 translate-y-0 sm:scale-100" leave="ease-in duration-200" leave-from="opacity-100 translate-y-0 sm:scale-100" leave-to="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95">
            <DialogPanel
              class="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg"
            >
              <MicroscopeCaptureModal
                :is-open="isMicroscopeCaptureModalOpen"
                @close="isMicroscopeCaptureModalOpen = false"
                @imageCaptured="handleCaptureFromModal"
              />

              <div v-if="isLivePreview || selectingLocalCamera" class="absolute inset-0 z-20 bg-black flex flex-col items-center justify-center">
                <video v-show="isLivePreview" ref="videoEl" class="w-full h-full object-contain" autoplay playsinline></video>
                <div v-if="selectingLocalCamera && !isLivePreview" class="p-6 bg-white rounded-lg w-full max-w-md">
                  <h3 class="text-lg font-medium text-gray-900 mb-4">Kullanılacak Kamerayı Seçin</h3>
                  <div v-if="localCameras.length > 0" class="space-y-2">
                    <button
                      v-for="camera in localCameras"
                      :key="camera.deviceId"
                      @click="startLocalCameraPreview(camera.deviceId)"
                      class="w-full btn btn-outline">
                      {{ camera.label || `Kamera ${camera.deviceId.substring(0, 6)}` }}
                    </button>
                  </div>
                  <p v-else class="text-gray-500 text-center">Kullanılabilir yerel kamera bulunamadı.</p>
                  <button @click="cancelCameraSelection" type="button" class="mt-4 w-full btn btn-outline">Geri</button>
                </div>
                <div v-if="isLivePreview" class="absolute bottom-0 left-0 right-0 p-4 flex justify-center items-center gap-4 bg-black bg-opacity-50">
                  <button @click="stopLocalCameraPreview(true)" type="button" class="btn btn-outline text-white border-white hover:bg-white hover:text-black">Geri</button>
                  <button @click="captureFromLocalCamera" type="button" class="p-4 bg-white rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                    </button>
                  <div class="w-24"></div>
                </div>
                <canvas ref="canvasEl" class="hidden"></canvas>
              </div>

              <form @submit.prevent="handleUpload">
                <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <DialogTitle
                    as="h3"
                    class="text-lg font-medium leading-6 text-gray-900"
                  >
                    Hasta '{{ patientId }}' için Görüntü Yükle
                  </DialogTitle>
                  <p class="text-sm text-gray-500">
                    Çalışma Alanı: {{ workspaceName }}
                  </p>

                  <div class="mt-4 space-y-4">
                    <div>
                      <label class="form-label">Görüntü Dosyası *</label>
                      <div class="mt-2 flex items-center gap-4">
                        <div
                          class="w-24 h-24 bg-gray-100 rounded-md flex items-center justify-center overflow-hidden"
                        >
                          <img
                            v-if="fileBlobUrl"
                            :src="fileBlobUrl"
                            class="w-full h-full object-cover rounded-md"
                            alt="Önizleme"
                          />
                          <svg
                            v-else
                            class="w-12 h-12 text-gray-300"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              stroke-linecap="round"
                              stroke-linejoin="round"
                              stroke-width="1"
                              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                            ></path>
                          </svg>
                        </div>
                        <div class="flex flex-col gap-2">
                          <button @click="triggerFileInput" type="button" class="btn btn-outline btn-sm" :disabled="isConnectingToMicroscope || selectingLocalCamera || isLivePreview">
                            Galeriden Seç
                          </button>
                          <button @click="promptMicroscopeCapture" type="button" class="btn btn-outline btn-sm" :disabled="isConnectingToMicroscope || selectingLocalCamera || isLivePreview">
                            {{ isConnectingToMicroscope ? 'Bağlanıyor...' : 'Mikroskoptan Çek' }}
                          </button>
                           <button @click="promptLocalCameraSelection" type="button" class="btn btn-outline btn-sm" :disabled="isConnectingToMicroscope || selectingLocalCamera || isLivePreview">
                             Kameradan Çek
                           </button>
                        </div>
                      </div>
                      <input
                        id="file-upload"
                        ref="fileInputEl"
                        name="file-upload"
                        type="file"
                        @change="onFileChange"
                        class="hidden"
                        accept="image/png, image/jpeg, image/tiff, image/x-dng"
                      />
                    </div>
                  </div>
                  <p v-if="error" class="text-red-500 text-sm mt-2"> {{ error }} </p>
                </div>

                <div
                  class="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6"
                >
                  <button
                    type="submit"
                    class="btn btn-primary w-full sm:ml-3 sm:w-auto"
                    :disabled="loading || isConnectingToMicroscope || selectingLocalCamera || isLivePreview"
                  >
                    {{ loading ? "Yükleniyor..." : "Yükle ve İşle" }}
                  </button>
                  <button
                    type="button"
                    class="btn btn-outline mt-3 w-full sm:mt-0 sm:w-auto"
                    @click="closeModal"
                    :disabled="loading || isConnectingToMicroscope"
                  >
                    İptal
                  </button>
                </div>
              </form>
            </DialogPanel>
          </TransitionChild>
        </div>
      </div>
    </Dialog>
  </TransitionRoot>
</template>

<script setup>
import { ref, watch, nextTick, onUnmounted } from "vue";
import {
  Dialog,
  DialogPanel,
  DialogTitle,
  TransitionRoot,
  TransitionChild,
} from "@headlessui/vue";
import { useToast } from "vue-toastification";
import MicroscopeCaptureModal from './MicroscopeCaptureModal.vue';

const props = defineProps({ isOpen: Boolean, workspaceName: String, patientId: String });
const emit = defineEmits(["close", "uploaded"]);
const toast = useToast();

const file = ref(null);
const fileBlobUrl = ref(null);
const loading = ref(false);
const error = ref("");
const fileInputEl = ref(null);
const isConnectingToMicroscope = ref(false);
const isMicroscopeCaptureModalOpen = ref(false);

const isLivePreview = ref(false);
const selectingLocalCamera = ref(false);
const localCameras = ref([]);
const selectedCameraId = ref('');
const videoEl = ref(null);
const canvasEl = ref(null);
const stream = ref(null);

watch(() => props.isOpen, (newVal) => {
    if (newVal) {
      error.value = '';
    }
    if (!newVal) {
      resetForm();
      stopLocalCameraPreview(false);
    }
  },
);

// --- TEMEL MANTIK DÜZELTMELERİ ---

// Dosya state'ini güncelleyen merkezi fonksiyon
const updateFileState = (newFile, existingBlobUrl = null) => {
  if (!(newFile instanceof File || newFile instanceof Blob)) {
    console.error("updateFileState geçersiz bir dosya aldı:", newFile);
    error.value = "Geçersiz dosya verisi.";
    return;
  }

  file.value = newFile;

  // Önceki blob'u (varsa) temizle
  if (fileBlobUrl.value) {
    URL.revokeObjectURL(fileBlobUrl.value);
  }

  // Yeni blob URL'ini ayarla
  fileBlobUrl.value = existingBlobUrl || URL.createObjectURL(newFile);
  error.value = ""; // Başarı durumunda hataları temizle
};

// 1. Galeriden Seç
const onFileChange = (e) => {
  const selectedFile = e.target.files[0];
  if (!selectedFile) return;
  updateFileState(selectedFile, null); // newFile olarak gönder, existingBlobUrl null
};

// 2. Mikroskop veya Kameradan Gelen
// Bu fonksiyon hem MicroscopeCaptureModal'dan hem de captureFromLocalCamera'dan çağrılır
const handleCaptureFromModal = ({ file: capturedFile, blobUrl: capturedBlobUrl }) => {
  updateFileState(capturedFile, capturedBlobUrl); // existingBlobUrl olarak gönder

  // İlgili tüm modal/önizleme durumlarını kapat
  isLivePreview.value = false;
  selectingLocalCamera.value = false;
  isMicroscopeCaptureModalOpen.value = false;
};

// --- Form ve Yükleme Mantığı ---

const handleUpload = async () => {
  if (!file.value || !fileBlobUrl.value) {
    error.value = "Lütfen bir görüntü dosyası seçin veya çekin.";
    return;
  }
  loading.value = true;
  error.value = "";
  const uploadData = {
    id: `fake-${Date.now()}`,
    file_name: file.value.name,
    blobUrl: fileBlobUrl.value,
    imageType: "simple",
    patientId: props.patientId,
    workspaceName: props.workspaceName,
  };

  // Simülasyon: blobUrl'in hemen revoke edilmemesi için resetForm'u geciktir
  setTimeout(() => {
    emit("uploaded", uploadData);
    loading.value = false;
    // resetForm() çağrısını buradan kaldırıyoruz, modal kapanırken (watch) veya
    // yeni bir dosya seçilirken (updateFileState) halledilecek.
    // Ancak, upload'dan sonra modal kapanacağı için watch'taki resetForm çalışacak.
  }, 1000);
};

const resetForm = () => {
  if (fileBlobUrl.value) {
    // blob'u burada revoke etmiyoruz, çünkü WorkSpaceView'a aktarıldı
    // Sadece referansları temizliyoruz
    fileBlobUrl.value = null;
  }
  file.value = null;
  if (fileInputEl.value) fileInputEl.value.value = null;
  error.value = '';
};

const triggerFileInput = () => { fileInputEl.value.click(); };

const closeModal = () => {
  stopLocalCameraPreview(false);
  emit("close");
};

// --- Mikroskop Mantığı ---
const promptMicroscopeCapture = async () => {
  isConnectingToMicroscope.value = true;
  error.value = '';
  let connectionSuccessful = false;
  let connectionError = '';
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000);

  try {
    await fetch('http://192.168.7.2:8080/', { method: 'HEAD', signal: controller.signal, mode: 'no-cors' });
    connectionSuccessful = true;
  } catch (err) {
      if (err.name === 'AbortError'){ connectionError = 'Mikroskopa bağlanılamadı (Timeout).'; }
      else { connectionError = 'Mikroskopa bağlanılamadı. Ağ veya CORS ayarlarını kontrol edin.'; }
      console.error('PiCam Connection Check Error:', err);
  } finally {
      clearTimeout(timeoutId);
      isConnectingToMicroscope.value = false;
  }

  if (connectionSuccessful) {
      isMicroscopeCaptureModalOpen.value = true;
  } else {
      error.value = connectionError;
      toast.error(error.value);
  }
};

// --- Yerel Kamera Mantığı ---
const promptLocalCameraSelection = async () => {
  error.value = '';
  selectingLocalCamera.value = true;
  isLivePreview.value = false;
  localCameras.value = [];

  try {
    // Önce izin al (boş bir istek)
    const tempStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
    // İzin alındıktan sonra cihazları listele
    const devices = await navigator.mediaDevices.enumerateDevices();
    localCameras.value = devices.filter(device => device.kind === 'videoinput');
    // Geçici stream'i hemen kapat
    tempStream.getTracks().forEach(track => track.stop());

    if (localCameras.value.length === 0) {
      error.value = "Kullanılabilir yerel kamera bulunamadı.";
      toast.warn(error.value);
      selectingLocalCamera.value = false;
    }
  } catch (err) {
    console.error("Yerel kameralar listelenemedi:", err);
    error.value = "Kamera erişim izni reddedildi veya bir hata oluştu.";
    toast.error(error.value);
    selectingLocalCamera.value = false;
  }
};

const startLocalCameraPreview = async (deviceId) => {
  selectedCameraId.value = deviceId;
  stopLocalCameraPreview(false); // Varsa eskisini durdur
  try {
    stream.value = await navigator.mediaDevices.getUserMedia({
        video: { deviceId: { exact: deviceId } }
    });
    selectingLocalCamera.value = false;
    isLivePreview.value = true;
    await nextTick();
    videoEl.value.srcObject = stream.value;
  } catch (err) {
    toast.error("Seçilen kamera başlatılamadı.");
    console.error("Kamera Başlatma Hatası:", err);
    isLivePreview.value = false;
    selectingLocalCamera.value = true;
  }
};

const stopLocalCameraPreview = (goBackToSelection = false) => {
  if (stream.value) {
    stream.value.getTracks().forEach(track => track.stop());
    stream.value = null;
  }
  if (videoEl.value) {
      videoEl.value.srcObject = null;
  }
  isLivePreview.value = false;
  if (goBackToSelection) {
      selectingLocalCamera.value = true;
  } else {
      selectingLocalCamera.value = false;
  }
};

const captureFromLocalCamera = () => {
  const video = videoEl.value;
  const canvas = canvasEl.value;
  if (!video || !canvas || !isLivePreview.value) return;

  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);

  canvas.toBlob((blob) => {
    if (!blob) {
      toast.error("Görüntü verisi oluşturulamadı.");
      return;
    }
    const fileName = `localcam-${Date.now()}.jpg`;
    const capturedFile = new File([blob], fileName, { type: 'image/jpeg' });
    const blobUrl = URL.createObjectURL(capturedFile);

    // Düzeltilmiş çağrı: handleCaptureFromModal'ı kullan
    handleCaptureFromModal({ file: capturedFile, blobUrl: blobUrl });
  }, 'image/jpeg');
};

const cancelCameraSelection = () => {
    selectingLocalCamera.value = false;
    error.value = '';
};

onUnmounted(() => { stopLocalCameraPreview(false); });
</script>

<style scoped>
/* Modal stilleri */
.btn { @apply inline-flex items-center justify-center rounded-md border border-transparent px-4 py-2 text-sm font-medium shadow-sm transition-all duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed; }
.btn-sm { @apply px-3 py-1.5 text-xs; }
.btn-primary { @apply bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-500; }
.btn-outline { @apply border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-indigo-500; }
.form-label { @apply block text-sm font-medium text-gray-700; }
.form-input { @apply mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm; }
</style>
