<template>
  <div class="viewer-toolbar-vertical">
    <button :class="{ active: activeTool === 'pan' }" @click="selectTool('pan')" title="Pan">
      <img src="@/assets/css/viewer-assets/pan.svg" alt="Pan" />
    </button>
    <button :class="{ active: activeTool === 'polygon' }" @click="selectTool('polygon')" title="Polygon Tool">
      <img src="@/assets/css/viewer-assets/brush.svg" alt="Polygon" />
    </button>
    <div class="separator"></div>
    <button @click="$emit('undo')" title="Undo">
      <img src="@/assets/css/viewer-assets/undo.svg" alt="Undo" />
    </button>
    <button @click="$emit('clear')" title="Clear All">
      <img src="@/assets/css/viewer-assets/delete.svg" alt="Clear" />
    </button>
    <div class="separator"></div>
    <button @click="$emit('previous-image')" title="Previous Image">
      <img src="@/assets/css/viewer-assets/previous.svg" alt="Previous" />
    </button>
    <button @click="$emit('next-image')" title="Next Image">
      <img src="@/assets/css/viewer-assets/next.svg" alt="Next" />
    </button>
    <div class="separator"></div>
    <button @click="$emit('save')" title="Save Annotations" class="save-btn">
      <img src="@/assets/css/viewer-assets/save.svg" alt="Save" />
    </button>
  </div>
</template>

<script setup>
defineProps({
  activeTool: String,
});

const emit = defineEmits(['select-tool', 'undo', 'clear', 'save', 'previous-image', 'next-image']);

const selectTool = (tool) => {
  emit('select-tool', tool);
};
</script>

<style scoped>
/* Sağ tarafta dikey duracak yeni stil */
.viewer-toolbar-vertical {
  position: absolute;
  top: 16px;
  right: 16px; /* Sol yerine sağa yasla */
  z-index: 10;
  display: flex;
  flex-direction: column;
  gap: 8px;
  background-color: white;
  padding: 8px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.15);
}
.viewer-toolbar-vertical button {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid transparent;
  background-color: #f3f4f6;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
}
.viewer-toolbar-vertical button:hover:not(:disabled) {
  background-color: #e5e7eb;
  border-color: #d1d5db;
}
.viewer-toolbar-vertical button.active {
  background-color: #dbeafe;
  border-color: #3b82f6;
  color: #3b82f6;
}
.viewer-toolbar-vertical button img {
  width: 20px;
  height: 20px;
}
.separator {
  height: 1px;
  background-color: #e5e7eb;
  margin: 4px 0;
}
.save-btn {
  background-color: #16a34a;
}
.save-btn:hover {
  background-color: #15803d;
}
</style>
