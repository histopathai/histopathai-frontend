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
              <form @submit.prevent="updateWorkspace">
                <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <DialogTitle as="h3" class="text-lg font-medium leading-6 text-gray-900">Çalışma Alanını Düzenle</DialogTitle>

                  <div class="mt-4 space-y-4">
                    <div>
                      <div class="flex justify-between items-center">
                        <label for="workspaceName" class="form-label">Veri Seti Adı *</label>
                        <span class="text-sm" :class="name.length > MAX_NAME_LENGTH ? 'text-red-500' : 'text-gray-500'">
                          {{ name.length }} / {{ MAX_NAME_LENGTH }}
                        </span>
                      </div>
                      <input
                        type="text"
                        v-model="name"
                        id="workspaceName"
                        class="form-input"
                        :class="{'border-red-500': errors.name}"
                        :maxlength="MAX_NAME_LENGTH"
                        placeholder="Örn: Prostat Kanser Veri Seti (PKVS)"
                      >
                      <p v-if="errors.name" class="mt-1 text-sm text-red-600">{{ errors.name }}</p>
                    </div>

                    <div>
                      <label for="organType" class="form-label">Organ Tipi *</label>
                      <input
                        type="text"
                        v-model="organType"
                        id="organType"
                        class="form-input"
                        :class="{'border-red-500': errors.organType}"
                        placeholder="Örn: Prostat"
                      >
                       <p v-if="errors.organType" class="mt-1 text-sm text-red-600">{{ errors.organType }}</p>
                    </div>

                    <div>
                      <label for="description" class="form-label">Açıklama *</label>
                      <textarea
                        v-model="description"
                        id="description"
                        class="form-input"
                        :class="{'border-red-500': errors.description}"
                        rows="3"
                        placeholder="Projenin veya veri setinin kısa açıklaması girilmelidir."
                      ></textarea>
                       <p v-if="errors.description" class="mt-1 text-sm text-red-600">{{ errors.description }}</p>
                    </div>

                    <div>
                      <label for="resource" class="form-label">Kaynak Tipi *</label>
                      <select v-model="resource" id="resource" class="form-input">
                        <option value="private">Özel (Kullanıcı Tarafından Oluşturuldu)</option>
                        <option value="public">Halka Açık (Mevcut Bir Veri Seti)</option>
                      </select>
                    </div>

                    <div class="border-t pt-4 space-y-4">
                        <div>
                            <label for="organization" class="form-label">Oluşturan Kurum (Organization) *</label>
                            <input
                              type="text"
                              v-model="organization"
                              id="organization"
                              class="form-input"
                              :class="{'border-red-500': errors.organization}"
                              placeholder="Örn: Bursa Uludağ Üniversitesi Tıp Fakültesi"
                            >
                            <p v-if="errors.organization" class="mt-1 text-sm text-red-600">{{ errors.organization }}</p>
                        </div>
                        <div>
                            <label for="license" class="form-label">Lisans *</label>
                            <input
                              type="text"
                              v-model="license"
                              id="license"
                              class="form-input"
                              :class="{'border-red-500': errors.license}"
                              placeholder="Örn: Kurum İçi Kullanım"
                            >
                            <p v-if="errors.license" class="mt-1 text-sm text-red-600">{{ errors.license }}</p>
                        </div>
                        <div class="grid grid-cols-2 gap-4">
                            <div>
                                <label for="releaseYear" class="form-label">Yıl *</label>
                                <input
                                  type="number"
                                  v-model="releaseYear"
                                  id="releaseYear"
                                  class="form-input"
                                  :class="{'border-red-500': errors.releaseYear}"
                                  placeholder="Örn: 2025"
                                >
                                <p v-if="errors.releaseYear" class="mt-1 text-sm text-red-600">{{ errors.releaseYear }}</p>
                            </div>
                            <div>
                                <label for="releaseVersion" class="form-label">Sürüm (Opsiyonel)</label>
                                <input type="text" v-model="releaseVersion" id="releaseVersion" class="form-input" placeholder="Örn: v1.0">
                            </div>
                        </div>
                    </div>

                    <div v-if="resource === 'public'">
                        <label for="resourceURL" class="form-label">Kaynak URL'i *</label>
                        <input
                          type="url"
                          v-model="resourceURL"
                          id="resourceURL"
                          class="form-input"
                          :class="{'border-red-500': errors.resourceURL}"
                          placeholder="https://pathology.example.com/dataset"
                        >
                        <p v-if="errors.resourceURL" class="mt-1 text-sm text-red-600">{{ errors.resourceURL }}</p>
                    </div>
                  </div>
                  </div>
                <div class="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                  <button type="submit" class="btn btn-primary sm:ml-3 sm:w-auto">Güncelle</button>
                  <button type="button" class="btn btn-outline mt-3 sm:mt-0 sm:w-auto" @click="$emit('close')">İptal</button>
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
import { ref, watch } from 'vue';
import { Dialog, DialogPanel, DialogTitle, TransitionChild, TransitionRoot } from '@headlessui/vue';

const props = defineProps({
  isOpen: Boolean,
  initialData: Object, // Düzenlenecek mevcut veriyi (ID dahil) prop olarak al
});
const emit = defineEmits(['close', 'updated']);

const MAX_NAME_LENGTH = 50;

// Form alanları (CreateWorkspaceModal ile aynı)
const workspaceId = ref(null); // Güncellenecek ID'yi saklamak için
const name = ref('');
const organType = ref('');
const description = ref('');
const license = ref('');
const organization = ref('');
const resourceURL = ref('');
const releaseYear = ref(null);
const releaseVersion = ref('');
const resource = ref('private');

const errors = ref({});

// Prop'tan gelen veri değiştiğinde (modal her açıldığında) formu doldur
watch(() => props.initialData, (newData) => {
  if (newData) {
    workspaceId.value = newData.id || null; // ID'yi sakla
    name.value = newData.name || '';
    organType.value = newData.organType || '';
    description.value = newData.description || '';
    license.value = newData.license || '';
    organization.value = newData.organization || '';
    resourceURL.value = newData.resourceURL || '';
    releaseYear.value = newData.releaseYear || null;
    releaseVersion.value = newData.releaseVersion || '';
    resource.value = newData.resource || 'private';
    errors.value = {}; // Hataları temizle
  }
}, { immediate: true }); // immediate: true -> component başlar başlamaz çalışır

// CreateWorkspaceModal'dan kopyalanan watch
watch(resource, (newValue) => {
  if (newValue === 'private') {
    resourceURL.value = '';
    if (errors.value.resourceURL) {
      delete errors.value.resourceURL;
    }
  }
});

// CreateWorkspaceModal'dan kopyalanan validateForm
const validateForm = () => {
  errors.value = {};

  if (!name.value.trim()) {
    errors.value.name = 'Veri Seti adı zorunludur.';
  } else if (name.value.length > MAX_NAME_LENGTH) {
    errors.value.name = `Ad ${MAX_NAME_LENGTH} karakterden uzun olamaz.`;
  }
  if (!organType.value.trim()) {
    errors.value.organType = 'Organ tipi zorunludur.';
  }
  if (!description.value.trim()) {
    errors.value.description = 'Açıklama zorunludur.';
  }
  if (!organization.value.trim()) {
    errors.value.organization = 'Kurum bilgisi zorunludur.';
  }
  if (!license.value.trim()) {
    errors.value.license = 'Lisans bilgisi zorunludur.';
  }
  if (!releaseYear.value) {
    errors.value.releaseYear = 'Yıl zorunludur.';
  } else if (releaseYear.value < 1900 || releaseYear.value > new Date().getFullYear() + 1) {
    errors.value.releaseYear = 'Geçerli bir yıl giriniz.';
  }
  if (resource.value === 'public' && !resourceURL.value.trim()) {
    errors.value.resourceURL = 'Halka açık kaynaklar için URL zorunludur.';
  }
  return Object.keys(errors.value).length === 0;
};

// CreateWorkspaceModal'daki 'createWorkspace' fonksiyonunun 'update' versiyonu
const updateWorkspace = () => {
  if (!validateForm()) {
    return;
  }

  // Güncellenmiş veriyi bir obje olarak topla
  const updatedData = {
    id: workspaceId.value, // HANGİ workspace'in güncelleneceği bilgisi
    name: name.value.trim(),
    organType: organType.value.trim(),
    description: description.value.trim(),
    resource: resource.value,
    organization: organization.value.trim(),
    license: license.value.trim(),
    releaseYear: releaseYear.value,
    releaseVersion: releaseVersion.value.trim(),
  };

  if (resource.value === 'public') {
    updatedData.resourceURL = resourceURL.value.trim();
  } else {
    updatedData.resourceURL = ''; // 'private' ise URL'in boş olduğundan emin ol
  }

  emit('updated', updatedData); // 'updated' event'i yayınla
  emit('close'); // Modal'ı kapat
};
</script>
