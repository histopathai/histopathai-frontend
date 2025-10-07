<template>
  <div id="annotations-tool">
    <label>Organ: <textarea :value="organ" @input="$emit('update:organ', $event.target.value)" rows="1" /> </label>
    <label>Diagnosis: <textarea :value="diagnosis" @input="$emit('update:diagnosis', $event.target.value)" rows="1" /></label>
    <label>Grade: <textarea :value="grade" @input="$emit('update:grade', $event.target.value)" rows="1" /></label>
    <label>Gender: <textarea :value="gender" @input="$emit('update:gender', $event.target.value)" rows="1" /></label>
    <label>Age: <input type="number" :value="age" @input="$emit('update:age', $event.target.value)" min="0" max="99" /></label>

    <!-- Tools -->
    <div class="tool-box">
      <h4>Tool</h4>
        <div class="tool-buttons-row">
          <div class="tool-buttons">
            <!-- Pan -->
            <button @click="$emit('clear-tools')" :class="{ 'active-button': activeTool === null }" >
              <img src="../../../assets/css/viewer-assets/pan.svg" alt="Pan" width="22" height="22" />
            </button>

            <!-- Brush -->
            <button @click="$emit('set-brush-tool')" :class="{ 'active-button': activeTool === 'brush' }">
              <img src="../../../assets/css/viewer-assets/brush.svg" alt="Brush" width="22" height="22" />
            </button>

            <!-- Undo (aktiflik kontrolü gerekmez) -->
            <button @click="$emit('undo')" :disabled="historyIndex <= 0">
              <img src="../../../assets/css/viewer-assets/undo.svg" alt="Undo" width="22" height="22" />
            </button>

            <!-- Delete -->
            <button @click="$emit('delete-selected')" :disabled="!selectedDeletableObject" :class="{ active: activeTool === 'delete' }">
              <img src="../../../assets/css/viewer-assets/delete.svg" alt="Delete" width="22" height="22" />
            </button>
          </div>

          <!-- Brush Settings -->
          <div class="brush-settings" v-if="isViewerReady && showBrushSettings">
            <label v-if="activeTool === 'brush'">
              Renk:
              <input
                type="color"
                :value="brushSettings.color"
                @input="$emit('update:brushSettings', { ...brushSettings, color: $event.target.value })"
              />
            </label>
            <label>Kalınlık:
              <input
                type="range"
                min="1"
                max="50"
                :value="brushSettings.brushsize"
                @input="$emit('update:brushSettings', { ...brushSettings, brushsize: Number($event.target.value) })"
              />
            </label>
          </div>
        </div>
    </div>
    <!-- Label Info Box -->
    <div class="label-info-box">
      <h4>Etiketler</h4>
      <div v-for="(item, i) in labels" :key="i" class="label-item">
        <div
          class="color-sample"
          :style="{ backgroundColor: item.color }"
          v-if="item.type === 'brush'"
        ></div>
        <div v-else class="bbox-sample">▭</div>
        <span>{{ item.label }}</span>
      </div>
    </div>


    <div class="navigation-box">
      <div class="navigation-buttons">
        <button @click="$emit('save')">
          <img src="../../../assets/css/viewer-assets/save.svg" alt="Kaydet" width="22" height="22" />
          <span>Kaydet</span>
        </button>
        <button @click="$emit('previous')">
          <img src="../../../assets/css/viewer-assets/previous.svg" alt="Önceki" width="22" height="22" />
          <span>Önceki</span>
        </button>
        <button @click="$emit('next')">
          <img src="../../../assets/css/viewer-assets/next.svg" alt="Sonraki" width="22" height="22" />
          <span>Sonraki</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  organ: String,
  diagnosis: String,
  grade: String,
  age: Number,
  gender: String,
  isViewerReady: Boolean,
  activeTool: [String, null],
  showBrushSettings: Boolean,
  brushSettings: Object,
  labels: Array,
  historyIndex: Number,
});

defineEmits([
  'update:organ',
  'update:diagnosis',
  'update:grade',
  'update:age',
  'update:gender',
  'save',
  'previous',
  'next',
  'clear-tools',
  'set-brush-tool',
  'undo',
  'delete-selected'
]);
</script>

<style scoped>
#annotations-tool {
  padding: 8px 12px;
  min-height: unset;
  display: flex;
  justify-content: flex-start;
  align-items: flex-start;
  gap: 16px;
  margin-bottom: 8px;
  border: #3b82f6 1px solid;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(202, 9, 9, 0.2);
}

#annotations-tool label {
  margin: 0 0 5px 0;
  color: #000000;
  font-size: 14px;
  text-align: left;
}

#annotations-tool textarea {
  width: 100%;
  min-height: 50px;
  resize: none;
  padding: 8px;
  background-color: #ffffff;
  color: #000000;
  border: 1px solid #444;
  border-radius: 4px;
  box-sizing: border-box;
  font-family: inherit;
  font-size: 14px;
  line-height: 1.5;
  word-wrap: break-word;
}

#annotations-tool input[type="number"] {
  width: 100%;
  min-height: 50px;
  padding: 8px;
  background-color: #ffffff;
  color: #000000;
  border: 1px solid #444;
  border-radius: 4px;
  box-sizing: border-box;
  font-family: inherit;
  font-size: 14px;
}

.navigation-box {
  flex-shrink: 0;

}

.navigation-buttons {
  display: flex;         /* Butonları yan yana dizer */
  gap: 8px;              /* Butonların arasına 8px boşluk koyar */
}

.navigation-box button {
  padding: 2px 12px;
  background-color: #ffffff;
  color: rgb(0, 0, 0);
  border: 1px solid #666;
  border-radius: 5px;
  cursor: pointer;
  font-size: 15px;
  font-weight: 500;
  min-width: 50px;
  height: 40px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.2);
  transition: all 0.3s ease;
  display: flex;
  justify-content: center;
  align-items: center;
}

.navigation-box button:hover {
  background-color: #3b82f6;
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0,0,0,0.25);
}

.navigation-box button:active {
  transform: scale(0.98);
}

.tool-box {
  border: 1px solid #444;
  border-radius: 8px;
  padding: 10px;
  background-color: #1f1f1f;
  width: auto;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.tool-box h4 {
  margin: 0 0 5px 0;
  color: white;
  font-weight: bold;
  border-bottom: 1px solid #555;
  padding-bottom: 4px;
}

.tool-buttons-row {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 12px;
}

.tool-buttons {
  display: flex;
  gap: 8px;
}

.tool-buttons button {
  background-color: #333;
  color: white;
  border: 1px solid #666;
  border-radius: 5px;
  padding: 6px 10px;
  cursor: pointer;
}

.tool-buttons button:hover {
  background-color: #3e8dcf;
}
.tool-buttons button.active-button {
  background-color: #3e8dcf !important;
  border-color: #3e8dcf;
  color: white;
  box-shadow: 0 0 0 2px rgba(62, 141, 207, 0.3);
}

.tool-buttons button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
  pointer-events: none;
}

.brush-settings label {
  display: flex;
  align-items: center;
  gap: 6px;
  color: white;
  font-size: 14px;
}

.brush-settings input[type="range"] {
  width: 100px;
}

.label-info-box {
  border: 1px solid #444;
  border-radius: 8px;
  padding: 10px;
  background-color: #1f1f1f;
  color: white;
  margin-top: 10px;
  width: 200px;
}

.label-item {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 6px;
}

.color-sample {
  width: 20px;
  height: 20px;
  border-radius: 3px;
  border: 1px solid #ccc;
}

.bbox-sample {
  width: 20px;
  height: 20px;
  border: 2px solid white;
  text-align: center;
  line-height: 20px;
  font-size: 14px;
}
</style>
