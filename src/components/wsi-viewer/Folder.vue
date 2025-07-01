<template>
  <div class="folder" :class="{ open: isOpen, closed: !isOpen }">
    <div class="folder-label" @click="toggleFolder">
      <span class="folder-icon">
        <img src="../../assets/css/viewer-assets/folder.svg" alt="icon" width="22" height="22" />
      </span>
      {{ label }}
    </div>
    <div class="children" v-if="isOpen">
      <template v-for="(val, key) in data" :key="key">
        <Folder
          v-if="typeof val === 'object' && key !== 'files'"
          :label="key"
          :data="val"
          :path="[...path, key]"
          :currentPath="currentPath"
          :savedFiles="savedFiles"
          @slide-clicked="emitClick"
        />
        <div
          v-if="key === 'files'"
          v-for="file in val"
          :key="file"
          class="file"
          :class="{ active: isActive(file), saved: isFileSaved(file) }"
          :title="getFullPath(file)"
          @click="emitClick(getFullPath(file))"
        >
          <span class="file-icon">
            <img src="../../assets/css/viewer-assets/pathology.svg" alt="icon" width="22" height="22" />
          </span>
          {{ file }}
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue';
import Folder from './Folder.vue';

const props = defineProps({
  data: Object,
  label: String,
  path: Array,
  currentPath: String,
  savedFiles: Object
});

const emit = defineEmits(['slide-clicked']);
const isOpen = ref(false);

const shouldBeOpen = computed(() => props.currentPath?.startsWith(props.path.join('/')));

watch(() => props.currentPath, () => {
  if (shouldBeOpen.value && !isOpen.value) isOpen.value = true;
});

const isFileSaved = (file) => props.savedFiles?.[getFullPath(file)];
const isActive = (file) => getFullPath(file) === props.currentPath;
const toggleFolder = (e) => { e.stopPropagation(); isOpen.value = !isOpen.value; };
const emitClick = (path) => emit('slide-clicked', path);
const getFullPath = (file) => [...props.path, file].join('/');
</script>

<style scoped>
.folder {
  background-color: #2a2a2a;
  border-radius: 5px;
  margin-bottom: 8px;
  transition: background-color 0.3s;
}

.folder-label {
  padding: 10px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 200;
  color: #ffffff;
}
.folder.open > .folder-label {
  font-weight: bold;
  color: #ffffff;
}

.folder-label::before {
  content: "▶";
  transform: rotate(0deg);
  transition: transform 0.25s ease;
  color: #ffffff;
}

.folder.open > .folder-label::before {
  transform: rotate(90deg);
}

.folder.open > .children {
  display: block;
}

.children {
  display: none;
  padding-left: 15px;
  border-left: 2px solid #00adb5;
  margin-left: 8px;
}

.file {
  color: #fff;
  background-color: transparent;
  display: flex;
  align-items: center;
  padding: 4px;
  border-radius: 4px;
  transition: background-color 0.3s ease;
  position: relative;
  word-break: break-word;
  min-width: 0;
}

.file:hover {
  background-color: #333;
  cursor: pointer;
}


.file.active {
  background-color: #e3f2fd !important;
  color: #0d47a1 !important;
  font-weight: 600;
  border-left: 4px solid #2196f3;
  margin-left: -4px;
  transition: all 0.2s ease;
}

.file.saved {
  background-color: #b9fbc0;
  color: #000;
}

.file.saved.active {
  background-color: #e3fcef;
  color: #000;
}

.file.saved::after {
  content: "✓";
  position: absolute;
  right: 10px;
  color: #2e7d32;
  font-weight: bold;
  pointer-events: none;
}

.file-icon {
  margin-right: 6px;
  font-size: 1rem;
  color: #00adb5;
}
</style>
