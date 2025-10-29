<template>
  <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-x-4 gap-y-2 items-end">
    <div>
      <label for="anno-organ" class="form-label text-xs">Organ</label>
      <input
        id="anno-organ"
        type="text"
        :value="organ"
        @input="$emit('update:organ', $event.target.value)"
        class="form-input form-input-sm"
        placeholder="Organ..."
      />
    </div>
    <div>
      <label for="anno-diagnosis" class="form-label text-xs">Teşhis</label>
      <input
        id="anno-diagnosis"
        type="text"
        :value="diagnosis"
        @input="$emit('update:diagnosis', $event.target.value)"
        class="form-input form-input-sm"
        placeholder="Teşhis..."
      />
    </div>
    <div>
      <label for="anno-grade" class="form-label text-xs">Derecelendirme</label>
      <input
        id="anno-grade"
        type="text"
        :value="grade"
        @input="$emit('update:grade', $event.target.value)"
        class="form-input form-input-sm"
        placeholder="Derecelendirme..."
      />
    </div>

    <div>
      <label for="anno-gender" class="form-label text-xs">Cinsiyet</label>
      <select
        id="anno-gender"
        :value="gender"
        @change="$emit('update:gender', $event.target.value)"
        class="form-input form-input-sm"
      >
        <option value="" disabled>Seçiniz...</option>
        <option value="Erkek">Erkek</option>
        <option value="Kadın">Kadın</option>
        <option value="Belirtmek istemiyor">Belirtmek istemiyor</option>
      </select>
    </div>
    <div>
      <label for="anno-age" class="form-label text-xs">Yaş</label>
      <input
        id="anno-age"
        type="number"
        :value="age"
        @input="$emit('update:age', $event.target.value)"
        class="form-input form-input-sm"
        placeholder="Yaş..."
        min="0"
        max="150"
      />
    </div>
  </div>
</template>

<script setup>
defineProps({ organ: String, diagnosis: String, grade: String, age: Number, gender: String });
defineEmits(['update:organ', 'update:diagnosis', 'update:grade', 'update:age', 'update:gender']);
</script>

<style scoped>
/* Stil gerekmiyor, main.css'teki .form-label ve .form-input-sm kullanılacak */
</style>
