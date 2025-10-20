<template>
  <TransitionRoot as="template" :show="isOpen">
    <Dialog as="div" class="relative z-10" @close="!loading && $emit('close')">
      <div class="fixed inset-0 z-10 overflow-y-auto">
        <div class="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <DialogPanel class="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
              <form @submit.prevent="handleUpload">
                <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <DialogTitle as="h3" class="text-lg font-medium leading-6 text-gray-900">
                    '{{ workspaceName }}' Alanına Görüntü Yükle
                  </DialogTitle>
                  <div class="mt-4 space-y-4">
                    <div>
                      <label for="file-upload" class="form-label">Görüntü Dosyası</label>
                      <input id="file-upload" name="file-upload" type="file" @change="onFileChange" required class="form-input" accept="image/png, image/jpeg, image/tiff">
                    </div>
                     <div>
                        <label class="form-label">Teşhis</label>
                        <input type="text" v-model="metadata.disease_type" class="form-input" placeholder="Örn: Carcinoma">
                     </div>
                      <div>
                        <label class="form-label">Tip</label>
                        <input type="text" v-model="metadata.sub_type" class="form-input" placeholder="Örn: Invasive">
                     </div>
                     <div>
                        <label class="form-label">Grade</label>
                        <input type="text" v-model="metadata.grade" class="form-input">
                     </div>
                  </div>
                   <p v-if="error" class="text-red-500 text-sm mt-2">{{ error }}</p>
                </div>
                <div class="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                  <button type="submit" class="btn btn-primary sm:ml-3 sm:w-auto" :disabled="loading">
                    {{ loading ? 'Yükleniyor...' : 'Yükle ve İşle' }}
                  </button>
                  <button type="button" class="btn btn-outline mt-3 sm:mt-0 sm:w-auto" @click="$emit('close')" :disabled="loading">İptal</button>
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

const props = defineProps({
  isOpen: Boolean,
  workspaceName: String,
  organType: String,
});

const emit = defineEmits(['close', 'uploaded']);
const toast = useToast();

const file = ref(null);
const fileBlobUrl = ref(null); // YENİ: Geçici Blob URL'i tutmak için

const metadata = reactive({
  dataset_name: '',
  organ_type: '',
  disease_type: '',
  classification: '',
  sub_type: '',
  grade: ''
});
const loading = ref(false);
const error = ref('');

watch(() => props.isOpen, (newVal) => {
  if (newVal) {
    metadata.dataset_name = props.workspaceName;
    metadata.organ_type = props.organType;
  } else {
    // Modal kapandığında formu ve blob'u temizle
    resetForm();
  }
});

const onFileChange = (e) => {
  const selectedFile = e.target.files[0];
  if (!selectedFile) {
    file.value = null;
    return;
  }

  file.value = selectedFile;

  // Önceki blob URL'i varsa temizle (memory leak önlemi)
  if (fileBlobUrl.value) {
    URL.revokeObjectURL(fileBlobUrl.value);
  }

  // YENİ: Seçilen dosya için bir blob URL oluştur
  fileBlobUrl.value = URL.createObjectURL(selectedFile);
};

const handleUpload = async () => {
  if (!file.value || !fileBlobUrl.value) {
    error.value = "Lütfen bir dosya seçin.";
    return;
  }
  loading.value = true;
  error.value = '';

  // Sahte veriyi oluştur
  const fakeImageData = {
    ...metadata,
    id: `fake-${Date.now()}`,
    file_name: file.value.name,
    blobUrl: fileBlobUrl.value, // YENİ: Blob URL'i ekle
    imageType: 'simple' // YENİ: OSD'ye bunun bir DZI olmadığını söylemek için
  };

  setTimeout(() => {
    emit('uploaded', fakeImageData);
    // Formu sıfırla, *ancak* blobUrl'i ana component aldığı için onu burada revoke etme
    file.value = null;
    fileBlobUrl.value = null; // Referansı temizle
    const fileInput = document.getElementById('file-upload');
    if(fileInput) fileInput.value = null;

    loading.value = false;
  }, 1000);
};

const resetForm = () => {
    // Blob URL'i temizle
    if (fileBlobUrl.value) {
      URL.revokeObjectURL(fileBlobUrl.value);
      fileBlobUrl.value = null;
    }
    file.value = null;
    const fileInput = document.getElementById('file-upload');
    if(fileInput) fileInput.value = null;

    Object.keys(metadata).forEach(key => {
        if(key !== 'dataset_name' && key !== 'organ_type') {
          metadata[key] = '';
        }
    });
}
</script>
