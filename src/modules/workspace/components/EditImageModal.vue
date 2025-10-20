<template>
  <TransitionRoot as="template" :show="isOpen">
    <Dialog as="div" class="relative z-10" @close="$emit('close')">
      <div class="fixed inset-0 z-10 overflow-y-auto">
        <div class="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <DialogPanel class="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
              <form @submit.prevent="handleUpdate">
                <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <DialogTitle as="h3" class="text-lg font-medium leading-6 text-gray-900">
                    Görüntü Bilgilerini Düzenle
                  </DialogTitle>
                  <p class="text-sm text-gray-500 mt-1 truncate">Dosya: {{ metadata.file_name }}</p>

                  <div class="mt-4 space-y-4">
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

                    <div class="grid grid-cols-2 gap-4">
                      <div>
                          <label class="form-label">Yaş</label>
                          <input type="number" v-model="metadata.age" class="form-input" placeholder="Örn: 65">
                      </div>
                      <div>
                          <label for="gender-select" class="form-label">Cinsiyet</label>
                          <select id="gender-select" v-model="metadata.gender" class="form-input">
                            <option value="" disabled>Lütfen bir seçenek belirleyin...</option>
                            <option value="Erkek">Erkek</option>
                            <option value="Kadın">Kadın</option>
                            <option value="Belirtmek istemiyor">Belirtmek istemiyor</option>
                          </select>
                      </div>
                    </div>
                    <div>
                      <label class="form-label">Irk</label>
                      <input type="text" v-model="metadata.race" class="form-input" placeholder="Örn: Kafkas">
                    </div>
                  </div>
                </div>
                <div class="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                  <button type="submit" class="btn btn-primary sm:ml-3 sm:w-auto">Güncelle</button>
                  <button type="button" class="btn btn-outline mt-3 sm:mt-0 sm:w-auto" @click="$emit('close')">İptal</button>
                </div>
              </form>
            </DialogPanel>
        </div>
      </div>
    </Dialog>
  </TransitionRoot>
</template>

<script setup>
import { reactive, watch } from 'vue';
import { Dialog, DialogPanel, DialogTitle, TransitionRoot } from '@headlessui/vue';

const props = defineProps({
  isOpen: Boolean,
  initialData: Object,
});

const emit = defineEmits(['close', 'updated']);

// initialData'dan gelen veriyi tutmak için reactive bir obje kullanıyoruz
const metadata = reactive({});

// Modal her açıldığında veya düzenlenecek veri değiştiğinde formu doldur
watch(() => props.initialData, (newData) => {
  if (newData) {
    // initialData'nın bir kopyasını metadata'ya ata
    // Bu, prop'u doğrudan değiştirmemizi engeller
    Object.assign(metadata, newData);
  }
}, { immediate: true, deep: true });

const handleUpdate = () => {
  // Güncellenmiş veriyi 'updated' eventi ile dışarı gönder
  emit('updated', metadata);
  emit('close');
};
</script>
