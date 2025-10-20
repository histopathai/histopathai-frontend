
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
                      <input id="file-upload" name="file-upload" type="file" @change="onFileChange" required class="form-input">
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
import axios from 'axios'; // API katmanı yerine direkt axios kullanabiliriz

const props = defineProps({
  isOpen: Boolean,
  workspaceName: String,
});

const emit = defineEmits(['close', 'uploaded']);
const toast = useToast();

const file = ref(null);
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

watch(() => props.workspaceName, (newName) => {
  metadata.dataset_name = newName;
});

const onFileChange = (e) => {
  file.value = e.target.files[0];
};

const handleUpload = async () => {
  if (!file.value) {
    error.value = "Lütfen bir dosya seçin.";
    return;
  }
  loading.value = true;
  error.value = '';

  const formData = new FormData();
  formData.append('image', file.value);
  Object.keys(metadata).forEach(key => {
    formData.append(key, metadata[key]);
  });

  try {
    const token = localStorage.getItem('auth_token');

    // --- DİNAMİK URL KULLANIMI ---
    const backendUrl = import.meta.env.VITE_BACKEND_URL;
    const uploadUrl = `${backendUrl}/images/upload`; // API client'larındaki gibi /api/v1'i zaten içeriyor.

    await axios.post(uploadUrl, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'Authorization': `Bearer ${token}`
      },
    });
    // --- DÜZELTME SONU ---

    emit('uploaded');
    resetForm();
  } catch (err) {
    error.value = 'Yükleme sırasında bir hata oluştu: ' + (err.response?.data?.message || err.message);
    toast.error(error.value);
  } finally {
    loading.value = false;
  }
};

const resetForm = () => {
    file.value = null;
    Object.keys(metadata).forEach(key => {
        if(key !== 'dataset_name') metadata[key] = '';
    });
}
</script>
