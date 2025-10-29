<template>
  <TransitionRoot as="template" :show="isOpen">
    <Dialog as="div" class="relative z-10" @close="$emit('close')">

      <TransitionChild as="template" enter="ease-out duration-300" enter-from="opacity-0" enter-to="opacity-100" leave="ease-in duration-200" leave-from="opacity-100" leave-to="opacity-0">
        <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
      </TransitionChild>
      <div class="fixed inset-0 z-10 overflow-y-auto">
        <div class="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
          <TransitionChild as="template" enter="ease-out duration-300" enter-from="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95" enter-to="opacity-100 translate-y-0 sm:scale-100" leave="ease-in duration-200" leave-from="opacity-100 translate-y-0 sm:scale-100" leave-to="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95">
            <DialogPanel class="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
              <form @submit.prevent="handleUpdatePatient">
                <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <DialogTitle as="h3" class="text-lg font-medium leading-6 text-gray-900">
                    Hasta Bilgilerini Düzenle
                  </DialogTitle>
                   <p class="text-sm text-gray-500 mt-1">Çalışma Alanı: {{ workspaceName }}</p>


                  <div class="mt-4 space-y-4">
                    <div>
                      <label class="form-label">Hasta Kodu / ID</label>
                      <input type="text" :value="patientData.patientId" class="form-input bg-gray-100" disabled title="Hasta Kodu değiştirilemez.">
                    </div>
                    <div>
                      <label class="form-label">Teşhis</label>
                      <input type="text" v-model="patientData.disease_type" class="form-input" placeholder="Örn: Carcinoma">
                    </div>
                    <div>
                      <label class="form-label">Tip</label>
                      <input type="text" v-model="patientData.sub_type" class="form-input" placeholder="Örn: Invasive">
                    </div>
                    <div class="grid grid-cols-2 gap-4">
                      <div>
                          <label class="form-label">Yaş</label>
                          <input type="number" v-model="patientData.age" class="form-input" placeholder="Örn: 65">
                      </div>
                      <div>
                          <label for="edit-gender-select" class="form-label">Cinsiyet</label>
                          <select id="edit-gender-select" v-model="patientData.gender" class="form-input">
                            <option value="" disabled>Seçiniz...</option>
                            <option value="Erkek">Erkek</option>
                            <option value="Kadın">Kadın</option>
                            <option value="Belirtmek istemiyor">Belirtmek istemiyor</option>
                          </select>
                      </div>
                    </div>
                    <div>
                      <label class="form-label">Irk</label>
                      <input type="text" v-model="patientData.race" class="form-input" placeholder="Örn: Kafkas">
                    </div>
                  </div>

                </div>
                <div class="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                  <button type="submit" class="btn btn-primary w-full sm:ml-3 sm:w-auto">Güncelle</button>
                  <button type="button" class="btn btn-outline mt-3 w-full sm:mt-0 sm:w-auto" @click="$emit('close')">İptal</button>
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
import { reactive, watch } from 'vue';
import { Dialog, DialogPanel, DialogTitle, TransitionRoot, TransitionChild } from '@headlessui/vue';

const props = defineProps({
  isOpen: Boolean,
  initialData: Object,
  workspaceName: String,
});
const emit = defineEmits(['close', 'patientUpdated']);

const patientData = reactive({
    // Initial structure to ensure reactivity even if initialData is initially empty
    patientId: '',
    age: '',
    gender: '',
    race: '',
    disease_type: '',
    sub_type: '',
    workspaceName: '' // Add workspaceName here too
});

watch(() => props.initialData, (newData) => {
  if (newData) {
    // Ensure all keys from initialData are copied
    for (const key in newData) {
        if (Object.prototype.hasOwnProperty.call(newData, key)) {
            patientData[key] = newData[key];
        }
    }
    // Set workspaceName separately from prop
    patientData.workspaceName = props.workspaceName;
  }
}, { immediate: true, deep: true });

const handleUpdatePatient = () => {
    // Make sure workspaceName is included when emitting
    const dataToEmit = { ...patientData, workspaceName: props.workspaceName };
    emit('patientUpdated', dataToEmit);
    emit('close');
};
</script>

<style scoped>
.btn { @apply inline-flex items-center justify-center rounded-md border border-transparent px-4 py-2 text-sm font-medium shadow-sm transition-all duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed; }
.btn-primary { @apply bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-500; }
.btn-outline { @apply border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-indigo-500; }
.form-label { @apply block text-sm font-medium text-gray-700; }
.form-input { @apply mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm; }
</style>
