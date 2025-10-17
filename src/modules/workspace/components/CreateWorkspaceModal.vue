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
                  <div class="mt-4">
                    <label for="workspaceName" class="form-label">Çalışma Alanı Adı</label>
                    <input type="text" v-model="name" id="workspaceName" class="form-input" required placeholder="Örn: BRCA Projesi">
                    <label for="organName" class="form-label mt-4">Organ Adı</label>
                    <input type="text" v-model="organ" id="organName" class="form-input" placeholder="Örn: Meme">
                    <label for="resource" class="form-label mt-4">Kaynak</label>
                    <select v-model="resource" id="resource" class="form-input mt-2">
                      <option value="public">Halka Açık</option>
                      <option value="private">Özel</option>
                    </select>
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
import { ref } from 'vue';
import { Dialog, DialogPanel, DialogTitle, TransitionChild, TransitionRoot } from '@headlessui/vue';
import { list } from 'postcss';

const props = defineProps({
  isOpen: Boolean,
});

const emit = defineEmits(['close', 'created']);

const name = ref('');
const error = ref('');

const createWorkspace = () => {
  if (!name.value.trim()) {
    error.value = 'Çalışma alanı adı boş olamaz.';
    return;
  }
  emit('created', name.value.trim());
  name.value = '';
  error.value = '';
};
</script>
