<template>
  <TransitionRoot as="template" :show="isOpen">
    <Dialog as="div" class="relative z-20" @close="cancelCapture">
      <div class="fixed inset-0 z-30 overflow-y-auto">
        <div class="flex min-h-full items-center justify-center p-4 text-center">
          <TransitionChild as="template" enter="ease-out duration-300" enter-from="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95" enter-to="opacity-100 translate-y-0 sm:scale-100" leave="ease-in duration-200" leave-from="opacity-100 translate-y-0 sm:scale-100" leave-to="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95">
            <DialogPanel class="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-md">
              <div class="p-6 text-center">
                <DialogTitle as="h3" class="text-lg font-medium leading-6 text-gray-900">Mikroskop Görüntüsü</DialogTitle>
                <div class="mt-4">
                  <div v-if="isCapturing" class="space-y-2">
                     <p>Görüntü çekiliyor...</p>
                     <p class="text-sm text-gray-500">(Bu işlem 30 saniyeye kadar sürebilir)</p>
                  </div>
                  <div v-if="captureError" class="text-red-500">
                    <p>Hata: {{ captureError }}</p>
                  </div>
                </div>
              </div>
              <div class="bg-gray-50 px-4 py-3 sm:px-6">
                <button type="button" class="btn btn-outline w-full" @click="cancelCapture" :disabled="isCapturing">
                  {{ isCapturing ? 'İptal Ediliyor...' : (captureError ? 'Kapat' : 'İptal') }}
                </button>
              </div>
            </DialogPanel>
          </TransitionChild>
        </div>
      </div>
    </Dialog>
  </TransitionRoot>
</template>

<script setup>
import { ref, watch, onUnmounted } from 'vue';
import { Dialog, DialogPanel, DialogTitle, TransitionChild, TransitionRoot } from '@headlessui/vue';
import { useToast } from 'vue-toastification';

const props = defineProps({ isOpen: Boolean });
const emit = defineEmits(['close', 'imageCaptured']);
const toast = useToast();

const isCapturing = ref(false);
const captureError = ref('');
let abortController = null; // Aktif fetch isteğini iptal etmek için

watch(() => props.isOpen, (newVal) => {
  if (newVal) {
    startCapture(); // Modal açıldığında çekimi başlat
  } else {
    // Modal dışarıdan kapatılırsa (nadiren olur ama önlem)
    if (abortController) {
      abortController.abort();
    }
  }
});

const startCapture = async () => {
  isCapturing.value = true;
  captureError.value = '';
  abortController = new AbortController();
  const timeoutId = setTimeout(() => {
      if (abortController) abortController.abort('timeout'); // Timeout durumunu belirt
  }, 30000); // 30 saniye timeout

  try {
    const response = await fetch('http://192.168.7.2:8080/capture', { signal: abortController.signal });
    clearTimeout(timeoutId); // Başarılıysa timeout'u temizle

    if (!response.ok) {
      throw new Error(`Sunucu hatası: ${response.status} ${response.statusText}`);
    }

    const blob = await response.blob();
    const fileName = `picam-${Date.now()}.dng`;
    const capturedFile = new File([blob], fileName, { type: 'image/x-dng' });
    const blobUrl = URL.createObjectURL(capturedFile);

    // Başarılı sonucu ImageUploadModal'a gönder
    emit('imageCaptured', { file: capturedFile, blobUrl: blobUrl });
    toast.success("Mikroskop görüntüsü başarıyla alındı.");
    closeModal(); // Başarılı olunca otomatik kapat

  } catch (err) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') {
        if (err.message === 'timeout'){ // Kendi timeout'umuz mu?
             captureError.value = 'Mikroskop yanıt vermedi (30sn Timeout).';
        } else {
             captureError.value = 'Çekim iptal edildi.'; // Kullanıcı iptal etti
        }
    } else {
      captureError.value = 'Görüntü alınamadı. Bağlantıyı kontrol edin.';
    }
    console.error("PiCam Capture Error:", err);
    // Hata durumunda modal açık kalır, kullanıcı kapatır
  } finally {
    isCapturing.value = false;
    abortController = null; // İşlem bitince controller'ı sıfırla
  }
};

const cancelCapture = () => {
  if (abortController) {
    abortController.abort(); // Devam eden fetch isteğini iptal et
  }
  closeModal();
};

const closeModal = () => {
    emit('close');
}

onUnmounted(() => {
    // Component kaldırılırken de isteği iptal et (önlem)
    if(abortController) {
        abortController.abort();
    }
});
</script>


<style scoped>
.btn { @apply inline-flex items-center justify-center rounded-md border border-transparent px-4 py-2 text-sm font-medium shadow-sm transition-all duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed; }
.btn-outline { @apply border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-indigo-500; }
</style>
