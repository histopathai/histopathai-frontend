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
              <form @submit.prevent="createWorkspace">
                <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <DialogTitle as="h3" class="text-lg font-medium leading-6 text-gray-900">Yeni Çalışma Alanı</DialogTitle>

                  <div class="mt-4 space-y-4">
                    <div>
                      <label for="workspaceName" class="form-label">Veri Seti Adı</label>
                      <input type="text" v-model="name" id="workspaceName" class="form-input" required placeholder="Örn: Prostat Kanser Veri Seti">
                    </div>
                    <div>
                      <label for="organType" class="form-label">Organ Tipi</label>
                      <input type="text" v-model="organType" id="organType" class="form-input" placeholder="Örn: Prostat">
                    </div>
                     <div>
                      <label for="description" class="form-label">Açıklama</label>
                      <textarea v-model="description" id="description" class="form-input" rows="3" placeholder="Veri setinin kısa açıklamasını içermelidir."></textarea>
                    </div>

                    <div>
                      <label for="resource" class="form-label">Kaynak Tipi</label>
                      <select v-model="resource" id="resource" class="form-input">
                        <option value="private">Özel (Kullanıcı Tarafından Oluşturuldu)</option>
                        <option value="public">Halka Açık (Mevcut Bir Veri Seti)</option>
                      </select>
                    </div>

                    <div class="border-t pt-4 space-y-4">
                        <div>
                            <label for="organization" class="form-label">Oluşturan Kurum (Organization)</label>
                            <input type="text" v-model="organization" id="organization" class="form-input" placeholder="Örn: Bursa Uludağ Üniversitesi Tıp Fakültesi Tıbbi Patoloji A.B.D.">
                        </div>
                        <div>
                            <label for="license" class="form-label">Lisans</label>
                            <input type="text" v-model="license" id="license" class="form-input" placeholder="Örn: Kurum İçi Kullanım">
                        </div>
                        <div class="grid grid-cols-2 gap-4">
                            <div>
                                <label for="releaseYear" class="form-label">Yıl</label>
                                <input type="number" v-model="releaseYear" id="releaseYear" class="form-input" placeholder="Örn: 2025">
                            </div>
                            <div>
                                <label for="releaseVersion" class="form-label">Sürüm</label>
                                <input type="text" v-model="releaseVersion" id="releaseVersion" class="form-input" placeholder="Örn: v1.0">
                            </div>
                        </div>
                    </div>

                    <div v-if="resource === 'public'">
                        <label for="resourceURL" class="form-label">Kaynak URL'i</label>
                        <input type="url" v-model="resourceURL" id="resourceURL" class="form-input" placeholder="https://pathology.example.com/dataset">
                    </div>
                  </div>
                  <div v-if="error" class="mt-3 text-red-600 text-sm">
                      {{ error }}
                  </div>
                </div>
                <div class="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                  <button type="submit" class="btn btn-primary sm:ml-3 sm:w-auto">Oluştur</button>
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
});
const emit = defineEmits(['close', 'created']);

// Form alanları için ref'ler
const name = ref('');
const organType = ref('');
const description = ref('');
const license = ref('');
const organization = ref('');
const resourceURL = ref('');
const releaseYear = ref(null);
const releaseVersion = ref('');
const resource = ref('private');

const error = ref('');

// Kaynak tipi 'private' olarak değiştiğinde sadece URL'i temizle
watch(resource, (newValue) => {
  if (newValue === 'private') {
    resourceURL.value = '';
  }
});

const resetForm = () => {
    name.value = '';
    organType.value = '';
    description.value = '';
    license.value = '';
    organization.value = '';
    resourceURL.value = '';
    releaseYear.value = null;
    releaseVersion.value = '';
    resource.value = 'private';
    error.value = '';
};

const createWorkspace = () => {
  if (!name.value.trim()) {
    error.value = 'Çalışma alanı adı boş olamaz.';
    return;
  }

  // Frontend'den toplanan verileri bir obje olarak hazırla
  const workspaceData = {
    name: name.value.trim(),
    organType: organType.value.trim(),
    description: description.value.trim(),
    resource: resource.value,
    organization: organization.value.trim(),
    license: license.value.trim(),
    releaseYear: releaseYear.value,
    releaseVersion: releaseVersion.value.trim(),
  };

  // Eğer kaynak halka açıksa, URL bilgisini de ekle
  if (resource.value === 'public') {
    workspaceData.resourceURL = resourceURL.value.trim();
  }

  emit('created', workspaceData);
  resetForm();
};
</script>
