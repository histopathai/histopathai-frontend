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
              <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div class="sm:flex sm:items-start">
                  <div class="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                    <svg class="h-6 w-6 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" aria-hidden="true">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126z" />
                    </svg>
                  </div>
                  <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <DialogTitle as="h3" class="text-lg font-medium leading-6 text-gray-900">Çalışma Alanını Sil</DialogTitle>
                    <div class="mt-2">
                      <p class="text-sm text-gray-500">
                        Bu işlem geri alınamaz. Bu, '<strong>{{ workspaceName }}</strong>' çalışma alanını ve içindeki tüm görüntüleri kalıcı olarak silecektir.
                      </p>
                      <p class="mt-4 text-sm text-gray-700">
                        Devam etmek için lütfen çalışma alanının adını aşağıya yazın.
                      </p>
                      <input
                        type="text"
                        v-model="typedName"
                        class="form-input mt-2 w-full"
                        :class="{ 'border-red-500 focus:border-red-500 focus:ring-red-500': showError }"
                        :placeholder="workspaceName"
                      >
                      <p v-if="showError" class="mt-1 text-sm text-red-600">
                        Girdiğiniz ad, veri seti adıyla eşleşmiyor.
                      </p>
                      </div>
                  </div>
                </div>
              </div>
              <div class="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                <button
                  type="button"
                  class="btn btn-danger sm:ml-3 sm:w-auto"
                  :disabled="!isConfirmed"
                  @click="$emit('confirm')"
                >
                  Sil
                </button>
                <button
                  type="button"
                  class="btn btn-outline mt-3 sm:mt-0 sm:w-auto"
                  @click="$emit('close')"
                >
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
import { ref, computed, watch } from 'vue';
import { Dialog, DialogPanel, DialogTitle, TransitionChild, TransitionRoot } from '@headlessui/vue';

const props = defineProps({
  isOpen: Boolean,
  workspaceName: String,
});

defineEmits(['close', 'confirm']);

const typedName = ref('');

const isConfirmed = computed(() => typedName.value === props.workspaceName);

// YENİ EKLENEN COMPUTED PROPERTY
// Kullanıcı bir şeyler yazdıysa ve yazdığı şey doğru isimle eşleşmiyorsa true döner.
const showError = computed(() => {
  return typedName.value.length > 0 && typedName.value !== props.workspaceName;
});
// / YENİ EKLENEN COMPUTED PROPERTY

watch(() => props.isOpen, (newValue) => {
  if (newValue) {
    typedName.value = '';
  }
});
</script>
