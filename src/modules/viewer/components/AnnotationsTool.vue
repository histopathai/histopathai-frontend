<template>
  <div id="annotations-tool">
    <label>Organ: <textarea :value="organ" @input="$emit('update:organ', $event.target.value)" rows="1" /> </label>
    <label>Diagnosis: <textarea :value="diagnosis" @input="$emit('update:diagnosis', $event.target.value)" rows="1" /></label>
    <label>Grade: <textarea :value="grade" @input="$emit('update:grade', $event.target.value)" rows="1" /></label>
    <label>Gender: <textarea :value="gender" @input="$emit('update:gender', $event.target.value)" rows="1" /></label>
    <label>Age: <input type="number" :value="age" @input="$emit('update:age', $event.target.value)" min="0" max="99" /></label>
  </div>
</template>

<script setup>
defineProps({
  organ: String,
  diagnosis: String,
  grade: String,
  age: Number,
  gender: String
});

defineEmits([
  'update:organ',
  'update:diagnosis',
  'update:grade',
  'update:age',
  'update:gender',
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
  padding: 8px;
  background-color: #ffffff;
  color: #000000;
  border: 1px solid #444;
  border-radius: 4px;
  box-sizing: border-box;
  font-family: inherit;
  font-size: 14px;
}
</style>
