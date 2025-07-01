<template>
  <div id="sidebar">
    <div id="sidebar-header">
      <span class="icon">
        <img src="../../assets/css/viewer-assets/folder.svg" alt="icon" width="22" height="22" />
      </span>
      <span id="sidebar-title">Slides</span>
    </div>
    <div id="tree" class="tree-root">
      <template v-if="treeData">
        <template v-for="(val, key) in treeData" :key="key">
          <Folder 
            :data="val" 
            :label="key" 
            :path="[key]" 
            :currentPath="currentPath"
            :savedFiles="savedFiles"
            @slide-clicked="handleSlideClicked" 
          />
        </template>
      </template>
    </div>
    <div class="sidebar-footer">
      Toplam WSI sayısı: <strong>{{ totalSlides }}</strong>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import Folder from './Folder.vue';

const props = defineProps({
  treeData: Object,
  currentPath: String,
  savedFiles: Object
});

const emit = defineEmits(['slide-selected']);

const treeData = ref({});
const totalSlides = ref(0);

const countSlides = (data) => {
  let count = 0;
  for (const key in data) {
    if (key === 'files' && Array.isArray(data[key])) {
      count += data[key].length;
    } else if (typeof data[key] === 'object') {
      count += countSlides(data[key]);
    }
  }
  return count;
};

onMounted(async () => {
  try {
    const res = await fetch('/api/tree');
    const data = await res.json();
    treeData.value = data;
    totalSlides.value = countSlides(data);
  } catch (err) {
    console.error('API fetch error:', err);
  }
});

function handleSlideClicked(path) {
  emit('slide-selected', path);
}
</script>

<style scoped>
#sidebar {
  width: 300px;
  background-color: #2c2c2c;
  color: #fff;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
}

#sidebar-header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 20px;
  font-size: 1.5rem;
  font-weight: bold;
  border-bottom: 1px solid #333;
}

.sidebar-footer {
  padding: 10px 15px;
  border-top: 1px solid #333;
  background-color: #1f1f1f;
  font-size: 0.9rem;
  color: #ccc;
}

#tree {
  max-height: 80vh;
  overflow-y: auto;
  padding: 10px 15px;
  font-size: 0.8rem;
}
</style>
