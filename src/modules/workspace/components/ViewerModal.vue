<template>
  <TransitionRoot as="template" :show="isOpen">
    <Dialog as="div" class="relative z-10" @close="$emit('close')">
      <TransitionChild as="template" enter="ease-out duration-300" enter-from="opacity-0" enter-to="opacity-100" leave="ease-in duration-200" leave-from="opacity-100" leave-to="opacity-0">
        <div class="fixed inset-0 bg-gray-900 bg-opacity-75 transition-opacity" />
      </TransitionChild>

      <div class="fixed inset-0 z-10 overflow-y-auto">
        <div class="flex min-h-full items-center justify-center p-4 text-center">
          <TransitionChild as="template" enter="ease-out duration-300" enter-from="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95" enter-to="opacity-100 translate-y-0 sm:scale-100" leave="ease-in duration-200" leave-from="opacity-100 translate-y-0 sm:scale-100" leave-to="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95">
            <DialogPanel class="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 w-full max-w-6xl h-[80vh]">
              <div class="absolute top-0 right-0 pt-4 pr-4 z-20">
                <button type="button" class="rounded-md bg-white text-gray-400 hover:text-gray-500" @click="$emit('close')">
                  <span class="sr-only">Kapat</span>
                  <svg class="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div class="w-full h-full bg-black" ref="viewerDiv"></div>

            </DialogPanel>
          </TransitionChild>
        </div>
      </div>
    </Dialog>
  </TransitionRoot>
</template>

<script setup>
import { ref, watch, nextTick, onUnmounted } from 'vue';
import { Dialog, DialogPanel, TransitionChild, TransitionRoot } from '@headlessui/vue';
import OpenSeadragon from 'openseadragon';

const props = defineProps({
  isOpen: Boolean,
  image: Object, // Görüntülenecek resmin objesi (artık blobUrl içerebilir)
});

const emit = defineEmits(['close']);

const viewerDiv = ref(null);
const viewer = ref(null);

watch(() => props.isOpen, (newVal) => {
  if (newVal) {
    nextTick(() => {
      initViewer();
    });
  } else {
    destroyViewer();
  }
});

const initViewer = () => {
  if (viewer.value) {
    viewer.value.destroy();
  }
  if (!viewerDiv.value || !props.image) {
    return;
  }

  let tileSourceOptions;

  // YENİ MANTIK: Görüntü tipi 'simple' (blob) ise
  if (props.image.imageType === 'simple' && props.image.blobUrl) {
    tileSourceOptions = {
      type: 'image',
      url: props.image.blobUrl
    };
  } else {
    // ESKİ MANTIK: DZI ise
    const tileUrl = props.image?.tileUrl || 'https://openseadragon.github.io/example-images/duomo/duomo.dzi';
    tileSourceOptions = tileUrl;
  }

  viewer.value = OpenSeadragon({
    element: viewerDiv.value,
    prefixUrl: 'https://openseadragon.github.io/openseadragon/images/',
    tileSources: [tileSourceOptions], // Değiştirilen seçenek
    sequenceMode: false,
    showNavigator: true,
    navigatorPosition: 'BOTTOM_RIGHT',
  });
};

const destroyViewer = () => {
  if (viewer.value) {
    viewer.value.destroy();
    viewer.value = null;
  }
};

onUnmounted(() => {
  destroyViewer();
});
</script>
