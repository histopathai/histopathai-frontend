<template>
  <TransitionRoot as="template" :show="isOpen">
    <Dialog as="div" class="relative z-20" @close="$emit('close')">
      <div class="fixed inset-0 z-30 overflow-y-auto">
        <div class="flex min-h-full items-center justify-center p-4 text-center">
          <TransitionChild as="template" enter="ease-out duration-300" enter-from="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95" enter-to="opacity-100 translate-y-0 sm:scale-100" leave="ease-in duration-200" leave-from="opacity-100 translate-y-0 sm:scale-100" leave-to="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95">
            <DialogPanel class="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
              <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div class="sm:flex sm:items-start">
                  <div class="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                    </div>
                  <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <DialogTitle as="h3" class="text-lg font-medium leading-6 text-gray-900">Görüntüyü Sil</DialogTitle>
                    <div class="mt-2">
                      <p class="text-sm text-gray-500">
                        '<strong>{{ imageName }}</strong>' adlı görüntüyü
                        '<strong>{{ workspaceName }}</strong>' çalışma alanından kalıcı olarak silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div class="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                <button type="button" class="btn btn-danger w-full sm:ml-3 sm:w-auto" @click="$emit('confirm')">
                  Sil
                </button>
                <button type="button" class="btn btn-outline mt-3 w-full sm:mt-0 sm:w-auto" @click="$emit('close')">
                  İptal
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
import { Dialog, DialogPanel, DialogTitle, TransitionChild, TransitionRoot } from '@headlessui/vue';

defineProps({
  isOpen: Boolean,
  imageName: String,
  workspaceName: String,
});

defineEmits(['close', 'confirm']);
</script>

<style scoped>
.btn { @apply inline-flex items-center justify-center rounded-md border border-transparent px-4 py-2 text-sm font-medium shadow-sm transition-all duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed; }
.btn-danger { @apply bg-red-600 text-white hover:bg-red-700 focus:ring-red-500; }
.btn-outline { @apply border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-indigo-500; }
</style>
