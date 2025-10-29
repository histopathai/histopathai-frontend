<template>
  <TransitionRoot as="template" :show="isOpen">
    <Dialog as="div" class="relative z-20" @close="$emit('close')">
      <TransitionChild as="template" enter="ease-out duration-300" enter-from="opacity-0" enter-to="opacity-100" leave="ease-in duration-200" leave-from="opacity-100" leave-to="opacity-0">
        <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
      </TransitionChild>
      <div class="fixed inset-0 z-30 overflow-y-auto">
        <div class="flex min-h-full items-center justify-center p-4 text-center">
          <TransitionChild as="template" enter="ease-out duration-300" enter-from="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95" enter-to="opacity-100 translate-y-0 sm:scale-100" leave="ease-in duration-200" leave-from="opacity-100 translate-y-0 sm:scale-100" leave-to="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95">
            <DialogPanel class="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
              <form @submit.prevent="confirmMove">
                <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <DialogTitle as="h3" class="text-lg font-medium leading-6 text-gray-900">Görüntüyü Taşı</DialogTitle>
                  <div class="mt-2">
                    <p class="text-sm text-gray-600"> Taşınacak Görüntü: <strong>{{ imageToMove?.file_name }}</strong> </p>
                    <p class="text-sm text-gray-500"> Mevcut Konum: {{ currentWorkspaceName }} / {{ currentPatientId }} </p>
                  </div>
                  <div class="mt-4">
                    <label for="targetPatient" class="form-label">Hedef Hasta Seçin:</label>
                    <select id="targetPatient" v-model="selectedTarget" class="form-input" required>
                      <option value="" disabled>-- Çalışma Alanı / Hasta Kodu --</option>
                      <optgroup v-for="(workspace, wsName) in availableTargets" :key="wsName" :label="wsName">
                        <option v-for="patient in workspace.patients" :key="`${wsName}-${patient.id}`" :value="`${wsName}|${patient.id}`"> {{ patient.id }} </option>
                      </optgroup>
                    </select>
                     <p v-if="!hasTargets" class="text-sm text-red-500 mt-1">Taşınabilecek başka hasta bulunamadı.</p>
                  </div>
                </div>
                <div class="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                  <button type="submit" class="btn btn-primary w-full sm:ml-3 sm:w-auto" :disabled="!selectedTarget || !hasTargets">Taşı</button>
                  <button type="button" class="btn btn-outline mt-3 w-full sm:mt-0 sm:w-auto" @click="$emit('close')">İptal</button>
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
// ... (script setup aynı) ...
import { ref, computed, watch } from 'vue';
import { Dialog, DialogPanel, DialogTitle, TransitionChild, TransitionRoot } from '@headlessui/vue';

const props = defineProps({ isOpen: Boolean, imageToMove: Object, currentWorkspaceName: String, currentPatientId: String, allWorkspaces: Object });
const emit = defineEmits(['close', 'confirmMove']);
const selectedTarget = ref('');
const availableTargets = computed(() => { const targets = {}; if (!props.allWorkspaces) return targets; for (const wsName in props.allWorkspaces) { const workspace = props.allWorkspaces[wsName]; const validPatients = workspace.patients.filter(p => !(wsName === props.currentWorkspaceName && p.id === props.currentPatientId)); if (validPatients.length > 0) { targets[wsName] = { ...workspace, patients: validPatients }; } } return targets; });
const hasTargets = computed(() => Object.keys(availableTargets.value).length > 0);
watch(() => props.isOpen, (newVal) => { if (newVal) { selectedTarget.value = ''; } });
const confirmMove = () => { if (!selectedTarget.value) return; const [targetWorkspaceName, targetPatientId] = selectedTarget.value.split('|'); emit('confirmMove', { targetWorkspaceName, targetPatientId }); emit('close'); };
</script>

<style scoped>
.btn { @apply inline-flex items-center justify-center rounded-md border border-transparent px-4 py-2 text-sm font-medium shadow-sm transition-all duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed; }
.btn-primary { @apply bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-500; }
.btn-outline { @apply border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-indigo-500; }
.form-label { @apply block text-sm font-medium text-gray-700; }
.form-input { @apply mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm; }
</style>
