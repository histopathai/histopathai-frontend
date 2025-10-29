<template>
  <div class="p-4 sm:p-8">
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
      <div class="flex items-center gap-4">
        <h1 class="text-2xl sm:text-3xl font-bold text-gray-900">Çalışma Alanlarım</h1>
        <button @click="isFilterAreaVisible = !isFilterAreaVisible" class="btn btn-ghost btn-sm">
          <span class="hidden sm:inline ml-1">Filtrele</span>
        </button>
      </div>
      <button @click="isCreateModalOpen = true" class="btn btn-primary btn-sm w-full sm:w-auto">
        <span class="ml-1">Yeni Çalışma Alanı Oluştur</span>
      </button>
    </div>

    <div v-if="isFilterAreaVisible" class="mb-6 p-4 bg-gray-50 rounded-lg shadow-sm">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div><label for="filterName" class="form-label text-sm">Ada Göre Ara</label><input type="text" id="filterName" v-model="filters.name" class="form-input form-input-sm" placeholder="İsim içerir..."></div>
        <div><label for="filterOrgan" class="form-label text-sm">Organ Tipi</label><select id="filterOrgan" v-model="filters.organType" class="form-input form-input-sm"><option value="">Tüm Organlar</option><option v-for="organ in uniqueOrganTypes" :key="organ" :value="organ">{{ organ }}</option></select></div>
        <div><label for="filterOrg" class="form-label text-sm">Kurum</label><select id="filterOrg" v-model="filters.organization" class="form-input form-input-sm"><option value="">Tüm Kurumlar</option><option v-for="org in uniqueOrganizations" :key="org" :value="org">{{ org }}</option></select></div>
        <div><label for="filterYear" class="form-label text-sm">Yıl</label><input type="text" id="filterYear" v-model="filters.releaseYear" class="form-input form-input-sm" placeholder="Örn: 2025"></div>
      </div>
      <div class="mt-4 flex justify-end"><button @click="resetFilters" class="btn btn-outline btn-sm">Filtreleri Temizle</button></div>
    </div>

    <CreateWorkspaceModal :is-open="isCreateModalOpen" @close="isCreateModalOpen = false" @created="handleWorkspaceCreated" />
    <DeleteWorkspaceModal :is-open="isDeleteModalOpen" :workspace-name="workspaceToDelete" @close="closeDeleteModal" @confirm="executeDeleteWorkspace" />
    <EditWorkspaceModal :is-open="isEditModalOpen" :initial-data="workspaceToEdit" @close="isEditModalOpen = false" @updated="handleWorkspaceUpdated" />
    <WSIViewerModal :is-open="isViewerModalOpen" :image="imageToView" @close="isViewerModalOpen = false" />
    <DeleteImageModal :is-open="isDeleteImageModalOpen" :image-name="imageToDelete ? imageToDelete.file_name : ''" :workspace-name="workspaceOfImageToDelete" @close="isDeleteImageModalOpen = false" @confirm="executeDeleteImage" />
    <CreatePatientModal :is-open="isCreatePatientModalOpen" :workspace-name="workspaceForNewPatient" @close="isCreatePatientModalOpen = false" @patientCreated="handlePatientCreated" />
    <ImageUploadModal :is-open="isUploadModalOpen" :workspace-name="selectedWorkspace" :patient-id="selectedPatientId" @close="isUploadModalOpen = false" @uploaded="handleImageUploaded" />
    <EditPatientModal :is-open="isEditPatientModalOpen" :initial-data="patientToEdit" :workspace-name="workspaceNameForPatientEdit" @close="isEditPatientModalOpen = false" @patientUpdated="handlePatientUpdated" />
    <DeletePatientModal :is-open="isDeletePatientModalOpen" :patient-id="patientToDelete ? patientToDelete.id : ''" :workspace-name="workspaceOfPatientToDelete" @close="closeDeletePatientModal" @confirm="executeDeletePatient" />
    <MoveImageModal :is-open="isMoveImageModalOpen" :image-to-move="imageToMove" :current-workspace-name="sourceWorkspaceForMove" :current-patient-id="sourcePatientForMove" :all-workspaces="workspaces" @close="closeMoveImageModal" @confirmMove="executeMoveImage" />
    <MovePatientModal :is-open="isMovePatientModalOpen" :patient-to-move="patientToMove" :current-workspace-name="sourceWorkspaceForMove" :all-workspace-names="allWorkspaceNames" @close="closeMovePatientModal" @confirmMove="executeMovePatient" />

    <div v-if="loading" class="text-center py-10"><p>Çalışma alanları yükleniyor...</p></div>
    <div v-else-if="error" class="text-red-500 text-center py-10"><p>{{ error }}</p></div>
    <div v-else-if="Object.keys(workspaces).length === 0" class="text-center py-10 text-gray-500"><p>Henüz bir çalışma alanı oluşturmadınız.</p></div>
    <div v-else-if="Object.keys(filteredWorkspaces).length === 0" class="text-center py-10 text-gray-500"><p>Filtre kriterlerinize uygun bir çalışma alanı bulunamadı.</p></div>

    <div v-else class="space-y-6">
      <div v-for="(workspace, name) in filteredWorkspaces" :key="name" class="card">
        <div class="card-header flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <div><h2 class="text-lg sm:text-xl font-semibold">{{ name }}</h2><div v-if="workspace.details" class="flex items-center gap-3 text-xs sm:text-sm text-gray-600 mt-1"><span><strong>Organ:</strong> {{ workspace.details.organType || 'Bilinmiyor' }}</span><span class="text-gray-300">|</span><span><strong>Kurum:</strong> {{ workspace.details.organization || 'Bilinmiyor' }}</span></div></div>
          <div class="flex gap-1 w-full sm:w-auto justify-end">
            <button @click="promptEditWorkspace(name)" class="btn btn-ghost btn-sm btn-icon-only sm:btn-icon-text" title="Düzenle">
              <span class="hidden sm:inline ml-1">Düzenle</span>
            </button>
            <button @click="promptCreatePatient(name)" class="btn btn-primary btn-sm btn-icon-only sm:btn-icon-text" title="Yeni Hasta Ekle">
              <span class="hidden sm:inline ml-1">Yeni Hasta Ekle</span>
            </button>
            <button @click="promptDeleteWorkspace(name)" class="btn btn-ghost-danger btn-sm btn-icon-only sm:btn-icon-text" title="Sil">
              <span class="hidden sm:inline ml-1">Sil</span>
            </button>
          </div>
        </div>

        <div class="card-body">
          <div v-if="workspace.patients.length === 0" class="text-gray-500 text-sm italic">Bu çalışma alanında henüz hasta yok.</div>
          <div v-else class="space-y-3">
            <div v-for="(patient, patientIndex) in workspace.patients" :key="patient.id" class="p-2 sm:p-3 border rounded-md bg-gray-50 hover:bg-gray-100 transition duration-150">
              <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-2 gap-2">
                <div>
                  <h4 class="font-semibold text-gray-800 text-sm sm:text-base">Hasta Kodu: {{ patient.details.patientId }}</h4>
                  <p class="text-xs sm:text-sm text-gray-600">
                    {{ patient.details.age ? `${patient.details.age} Yaş` : '' }}
                    {{ patient.details.gender ? ` | ${patient.details.gender}` : '' }}
                    {{ patient.details.disease_type ? ` | ${patient.details.disease_type}` : '' }}
                  </p>
                </div>
                <div class="flex gap-1 sm:gap-1.5 flex-shrink-0">
                   <button @click="promptEditPatient(patient, name)" class="btn btn-ghost btn-xs btn-icon-only sm:btn-icon-text" title="Hasta Düzenle">
                      <span class="hidden sm:inline ml-1">Düzenle</span>
                   </button>
                   <button @click="promptMovePatient(patient, name, patientIndex)" class="btn btn-ghost btn-xs btn-icon-only sm:btn-icon-text" title="Hasta Taşı">
                       <span class="hidden sm:inline ml-1">Taşı</span>
                   </button>
                   <button @click="openUploadModal(name, patient.id)" class="btn btn-outline btn-xs btn-icon-only sm:btn-icon-text" title="Görüntü Yükle">
                       <span class="hidden sm:inline ml-1">Görüntü Yükle</span>
                   </button>
                   <button @click="promptDeletePatient(patient, name, patientIndex)" class="btn btn-ghost-danger btn-xs btn-icon-only sm:btn-icon-text" title="Hasta Sil">
                       <span class="hidden sm:inline ml-1">Sil</span>
                   </button>
                </div>
              </div>
              <div v-if="patient.images.length === 0" class="text-gray-500 text-xs italic ml-1">Bu hastaya ait görüntü yok.</div>
              <div v-else class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
                <div v-for="(image, imageIndex) in patient.images" :key="image.id" class="border rounded shadow-sm bg-white overflow-hidden flex flex-col">
                  <div class="aspect-w-1 aspect-h-1 flex items-center justify-center bg-gray-200 overflow-hidden">
                      <img :src="getThumbnailUrl(image)" :alt="image.file_name" class="max-w-full max-h-full object-contain" @error="handleImageError">
                  </div>
                  <div class="p-2 border-t border-gray-100">
                      <p class="text-xs font-semibold truncate mb-1.5">{{ image.file_name }}</p>
                      <div class="flex justify-end gap-2 text-xs">
                        <button @click="viewImage(image)" class="btn-image-action text-blue-600 hover:text-blue-800">Görüntüle</button>
                        <button @click="promptMoveImage(image, name, patient.id, imageIndex)" class="btn-image-action text-purple-600 hover:text-purple-800">Taşı</button>
                        <button @click="promptDeleteImage(image, name, patient.id)" class="btn-image-action text-red-600 hover:text-red-800">Sil</button>
                      </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { useToast } from 'vue-toastification';
import imageCatalogAPI from '@/api/image_catalog.js';

// --- Component Imports ---
import CreateWorkspaceModal from '../components/CreateWorkspaceModal.vue';
import EditWorkspaceModal from '../components/EditWorkspaceModal.vue';
import DeleteWorkspaceModal from '../components/DeleteWorkspaceModal.vue';
import CreatePatientModal from '../components/CreatePatientModal.vue';
import ImageUploadModal from '../components/ImageUploadModal.vue';
import DeleteImageModal from '../components/DeleteImageModal.vue';
import WSIViewerModal from '../components/ViewerModal.vue';
import EditPatientModal from '../components/EditPatientModal.vue';
import DeletePatientModal from '../components/DeletePatientModal.vue';
import MoveImageModal from '../components/MoveImageModal.vue';
import MovePatientModal from '../components/MovePatientModal.vue';

// --- Core State ---
const router = useRouter();
const toast = useToast();
const workspaces = ref({});
const loading = ref(true);
const error = ref(null);

// --- Modal State Management ---
const isCreateModalOpen = ref(false);
const isEditModalOpen = ref(false);
const workspaceToEdit = ref(null);
const originalWorkspaceNameToEdit = ref('');
const isDeleteModalOpen = ref(false);
const workspaceToDelete = ref('');

const isCreatePatientModalOpen = ref(false);
const workspaceForNewPatient = ref('');
const isEditPatientModalOpen = ref(false);
const patientToEdit = ref(null);
const workspaceNameForPatientEdit = ref('');
const isDeletePatientModalOpen = ref(false);
const patientToDelete = ref(null);
const workspaceOfPatientToDelete = ref('');
const patientIndexToDelete = ref(-1);

const isUploadModalOpen = ref(false);
const selectedWorkspace = ref('');
const selectedPatientId = ref('');
const isDeleteImageModalOpen = ref(false);
const imageToDelete = ref(null);
const workspaceOfImageToDelete = ref('');
const patientOfImageToDelete = ref('');

const isViewerModalOpen = ref(false);
const imageToView = ref(null);

const isMoveImageModalOpen = ref(false);
const imageToMove = ref(null);
const imageIndexToMove = ref(-1);
const isMovePatientModalOpen = ref(false);
const patientToMove = ref(null);
const patientIndexToMove = ref(-1);
const sourceWorkspaceForMove = ref('');
const sourcePatientForMove = ref('');

// --- Filtering Logic ---
const isFilterAreaVisible = ref(false);
const filters = reactive({ name: '', organType: '', organization: '', releaseYear: '' });

const uniqueOrganTypes = computed(() => {
  const allTypes = Object.values(workspaces.value).map(ws => ws.details?.organType).filter(Boolean);
  return [...new Set(allTypes)].sort();
});
const uniqueOrganizations = computed(() => {
  const allOrgs = Object.values(workspaces.value).map(ws => ws.details?.organization).filter(Boolean);
  return [...new Set(allOrgs)].sort();
});
const allWorkspaceNames = computed(() => Object.keys(workspaces.value).sort());

const filteredWorkspaces = computed(() => {
  const allWorkspaces = workspaces.value;
  const nameQuery = filters.name.toLowerCase().trim();
  const organQuery = filters.organType.toLowerCase();
  const orgQuery = filters.organization.toLowerCase();
  const yearQuery = String(filters.releaseYear).trim();
  if (!nameQuery && !organQuery && !orgQuery && !yearQuery) { return allWorkspaces; }
  const filtered = {};
  for (const [name, workspace] of Object.entries(allWorkspaces)) {
    const details = workspace.details;
    if (!details) continue;
    const nameMatch = nameQuery ? name.toLowerCase().includes(nameQuery) : true;
    const organMatch = organQuery ? (details.organType || '').toLowerCase() === organQuery : true;
    const orgMatch = orgQuery ? (details.organization || '').toLowerCase() === orgQuery : true;
    const yearMatch = yearQuery ? String(details.releaseYear || '').includes(yearQuery) : true;
    if (nameMatch && organMatch && orgMatch && yearMatch) { filtered[name] = workspace; }
  }
  return filtered;
});

const resetFilters = () => {
  filters.name = '';
  filters.organType = '';
  filters.organization = '';
  filters.releaseYear = '';
};

// --- Data Fetching ---
const fetchWorkspaces = async () => {
  loading.value = true;
  error.value = null;
  try {
    if (Object.keys(workspaces.value).length > 0) {
      loading.value = false;
      return;
    }
    workspaces.value = {};
  } catch (err) {
    if(err.response?.status !== 404) {
      error.value = 'Çalışma alanları yüklenirken bir hata oluştu.';
      toast.error(error.value);
    }
    workspaces.value = {};
  } finally {
    loading.value = false;
  }
};

// --- Workspace CRUD ---
const handleWorkspaceCreated = (workspaceData) => {
  const name = workspaceData.name;
  if (!workspaces.value[name]) {
    workspaces.value[name] = { details: workspaceData, patients: [] };
  }
  isCreateModalOpen.value = false;
  toast.success(`'${name}' çalışma alanı oluşturuldu!`);
};
const promptEditWorkspace = (workspaceName) => {
  const workspace = workspaces.value[workspaceName];
  if (workspace && workspace.details) {
    originalWorkspaceNameToEdit.value = workspaceName;
    workspaceToEdit.value = { ...workspace.details };
    isEditModalOpen.value = true;
  } else {
    toast.error('Bu çalışma alanının detayları bulunamadı.');
  }
};
const handleWorkspaceUpdated = (updatedData) => {
  const originalName = updatedData.originalName; // Edit modal'dan gelen originalName'i al
  const newName = updatedData.name;
  if (!workspaces.value[originalName]) {
    toast.error('Güncellenecek orijinal çalışma alanı bulunamadı.');
    return;
  }
  if (originalName === newName) {
    workspaces.value[originalName].details = updatedData;
  } else {
    if (workspaces.value[newName]) {
      toast.error(`'${newName}' adında başka bir çalışma alanı zaten mevcut.`);
      return;
    }
    workspaces.value[newName] = { ...workspaces.value[originalName] };
    workspaces.value[newName].details = updatedData;
    delete workspaces.value[originalName];
  }
  isEditModalOpen.value = false;
  toast.success(`'${newName}' çalışma alanı güncellendi.`);
  originalWorkspaceNameToEdit.value = '';
};
const promptDeleteWorkspace = (workspaceName) => {
  workspaceToDelete.value = workspaceName;
  isDeleteModalOpen.value = true;
};
const executeDeleteWorkspace = async () => {
  const workspaceName = workspaceToDelete.value;
  try {
    const workspace = workspaces.value[workspaceName];
    if (workspace && workspace.patients) {
      workspace.patients.forEach(patient => {
        patient.images.forEach(image => {
          if (image.blobUrl) URL.revokeObjectURL(image.blobUrl);
        });
      });
    }
    delete workspaces.value[workspaceName];
    toast.success(`'${workspaceName}' çalışma alanı başarıyla silindi.`);
  } catch (err) {
    toast.error('Çalışma alanı silinirken bir hata oluştu.', { timeout: 3000 });
    console.error(err);
  } finally {
    closeDeleteModal();
  }
};
const closeDeleteModal = () => {
  isDeleteModalOpen.value = false;
  setTimeout(() => { workspaceToDelete.value = ''; }, 300);
};

// --- Patient CRUD ---
const promptCreatePatient = (workspaceName) => {
  workspaceForNewPatient.value = workspaceName;
  isCreatePatientModalOpen.value = true;
};
const handlePatientCreated = (patientData) => {
  const { workspaceName, ...details } = patientData;
  const workspace = workspaces.value[workspaceName];
  if (workspace) {
    const exists = workspace.patients.some(p => p.id === details.patientId);
    if (exists) {
      toast.error(`'${details.patientId}' kodlu hasta bu çalışma alanında zaten mevcut.`);
      return;
    }
    workspace.patients.push({ id: details.patientId, details: details, images: [] });
    toast.success(`'${details.patientId}' kodlu hasta eklendi.`);
    isCreatePatientModalOpen.value = false;
  }
};
const promptEditPatient = (patient, workspaceName) => {
  patientToEdit.value = { ...patient.details };
  workspaceNameForPatientEdit.value = workspaceName;
  isEditPatientModalOpen.value = true;
};
const handlePatientUpdated = (updatedPatientData) => {
  const workspaceName = updatedPatientData.workspaceName;
  if (!workspaceName || !workspaces.value[workspaceName]) {
    toast.error('Hasta güncellenirken bir hata oluştu: Çalışma alanı bulunamadı.');
    return;
  }
  const patients = workspaces.value[workspaceName].patients;
  const patientIndex = patients.findIndex(p => p.id === updatedPatientData.patientId);
  if (patientIndex > -1) {
    patients[patientIndex].details = updatedPatientData;
    toast.success(`Hasta '${updatedPatientData.patientId}' güncellendi.`);
  } else {
    toast.error('Güncellenecek hasta bulunamadı.');
  }
  isEditPatientModalOpen.value = false;
};
const promptDeletePatient = (patient, workspaceName, index) => {
  patientToDelete.value = patient;
  workspaceOfPatientToDelete.value = workspaceName;
  patientIndexToDelete.value = index;
  isDeletePatientModalOpen.value = true;
};
const executeDeletePatient = async () => {
  const workspaceName = workspaceOfPatientToDelete.value;
  const index = patientIndexToDelete.value;
  const patientId = patientToDelete.value?.id;
  if (!workspaceName || index < 0 || !patientId || !workspaces.value[workspaceName]) {
    toast.error('Hasta silinirken bir hata oluştu: Gerekli bilgi bulunamadı.');
    closeDeletePatientModal();
    return;
  }
  try {
    const workspace = workspaces.value[workspaceName];
    const patientToRemove = workspace.patients[index];
    if (patientToRemove.images) {
      patientToRemove.images.forEach(image => {
        if (image.blobUrl) URL.revokeObjectURL(image.blobUrl);
      });
    }
    workspace.patients.splice(index, 1);
    toast.success(`Hasta '${patientId}' başarıyla silindi.`);
  } catch (err) {
    toast.error('Hasta silinirken bir hata oluştu.', { timeout: 3000 });
    console.error(err);
  } finally {
    closeDeletePatientModal();
  }
};
const closeDeletePatientModal = () => {
  isDeletePatientModalOpen.value = false;
  setTimeout(() => {
    patientToDelete.value = null;
    workspaceOfPatientToDelete.value = '';
    patientIndexToDelete.value = -1;
  }, 300);
};

// --- Image CRUD ---
const openUploadModal = (workspaceName, patientId) => {
  selectedWorkspace.value = workspaceName;
  selectedPatientId.value = patientId;
  isUploadModalOpen.value = true;
};
const handleImageUploaded = (uploadData) => {
  isUploadModalOpen.value = false;
  const { workspaceName, patientId, ...fakeImage } = uploadData;
  if (workspaceName && patientId) {
    try {
      const workspace = workspaces.value[workspaceName];
      const patient = workspace.patients.find(p => p.id === patientId);
      patient.images.push(fakeImage);
      toast.success(`'${fakeImage.file_name}' görüntüsü eklendi!`);
    } catch (e) {
      toast.error('Görüntü eklenirken bir sorun oluştu.');
      console.error(e);
    }
  }
};
const promptDeleteImage = (image, workspaceName, patientId) => {
  imageToDelete.value = image;
  workspaceOfImageToDelete.value = workspaceName;
  patientOfImageToDelete.value = patientId;
  isDeleteImageModalOpen.value = true;
};
const executeDeleteImage = async () => {
  const imageId = imageToDelete.value.id;
  const workspaceName = workspaceOfImageToDelete.value;
  const patientId = patientOfImageToDelete.value;
  try {
    const workspace = workspaces.value[workspaceName];
    const patient = workspace.patients.find(p => p.id === patientId);
    if (patient) {
      const images = patient.images;
      const index = images.findIndex(img => img.id === imageId);
      if (index > -1) {
        const imageToRevoke = images[index];
        if (imageToRevoke.blobUrl) URL.revokeObjectURL(imageToRevoke.blobUrl);
        images.splice(index, 1);
        toast.success('Görüntü başarıyla silindi.');
      }
    }
  } catch (err) {
    toast.error('Görüntü silinirken bir hata oluştu.', { timeout: 3000 });
  } finally {
    isDeleteImageModalOpen.value = false;
    imageToDelete.value = null;
    workspaceOfImageToDelete.value = '';
    patientOfImageToDelete.value = '';
  }
};

// --- Move Logic ---
const promptMoveImage = (image, workspaceName, patientId, index) => {
  imageToMove.value = image;
  imageIndexToMove.value = index;
  sourceWorkspaceForMove.value = workspaceName;
  sourcePatientForMove.value = patientId;
  isMoveImageModalOpen.value = true;
};
const executeMoveImage = ({ targetWorkspaceName, targetPatientId }) => {
  const sourceWS = workspaces.value[sourceWorkspaceForMove.value];
  const targetWS = workspaces.value[targetWorkspaceName];
  if (!sourceWS || !targetWS || imageIndexToMove.value < 0) {
    toast.error("Görüntü taşınırken hata: Kaynak veya hedef bulunamadı.");
    closeMoveImageModal();
    return;
  }
  const sourcePatient = sourceWS.patients.find(p => p.id === sourcePatientForMove.value);
  const targetPatient = targetWS.patients.find(p => p.id === targetPatientId);
  if (!sourcePatient || !targetPatient) {
    toast.error("Görüntü taşınırken hata: Kaynak veya hedef hasta bulunamadı.");
    closeMoveImageModal();
    return;
  }
  try {
    const image = sourcePatient.images.splice(imageIndexToMove.value, 1)[0];
    targetPatient.images.push(image);
    toast.success(`Görüntü '${targetWorkspaceName}/${targetPatientId}' hedefine taşındı.`);
  } catch (err) {
    toast.error("Görüntü taşınırken bir hata oluştu.");
    console.error(err);
  } finally {
    closeMoveImageModal();
  }
};
const closeMoveImageModal = () => {
  isMoveImageModalOpen.value = false;
  setTimeout(() => {
    imageToMove.value = null;
    imageIndexToMove.value = -1;
    sourceWorkspaceForMove.value = '';
    sourcePatientForMove.value = '';
  }, 300);
};
const promptMovePatient = (patient, workspaceName, index) => {
  patientToMove.value = patient;
  patientIndexToMove.value = index;
  sourceWorkspaceForMove.value = workspaceName;
  isMovePatientModalOpen.value = true;
};
const executeMovePatient = (targetWorkspaceName) => {
  const sourceWS = workspaces.value[sourceWorkspaceForMove.value];
  const targetWS = workspaces.value[targetWorkspaceName];
  if (!sourceWS || !targetWS || patientIndexToMove.value < 0) {
    toast.error("Hasta taşınırken hata: Kaynak veya hedef bulunamadı.");
    closeMovePatientModal();
    return;
  }
  const patientIdToMove = patientToMove.value.id;
  if (targetWS.patients.some(p => p.id === patientIdToMove)) {
    toast.error(`'${targetWorkspaceName}' çalışma alanında '${patientIdToMove}' kodlu hasta zaten mevcut.`);
    closeMovePatientModal();
    return;
  }
  try {
    const patient = sourceWS.patients.splice(patientIndexToMove.value, 1)[0];
    targetWS.patients.push(patient);
    toast.success(`Hasta '${patient.id}', '${targetWorkspaceName}' hedefine taşındı.`);
  } catch(err) {
    toast.error("Hasta taşınırken bir hata oluştu.");
    console.error(err);
  } finally {
    closeMovePatientModal();
  }
};
const closeMovePatientModal = () => {
  isMovePatientModalOpen.value = false;
  setTimeout(() => {
    patientToMove.value = null;
    patientIndexToMove.value = -1;
    sourceWorkspaceForMove.value = '';
  }, 300);
};

// --- Utilities ---
const viewImage = (image) => {
  imageToView.value = image;
  isViewerModalOpen.value = true;
}
const getThumbnailUrl = (image) => {
  if (image.blobUrl) return image.blobUrl;
  if (String(image.id).startsWith('fake-')) return 'https://via.placeholder.com/200x150/EBF4FF/808080?text=Thumbnail';
  return imageCatalogAPI.getThumbnailUrl(image.id);
}
const handleImageError = (event) => {
  event.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIHZpZXdCb3g9IjAgMCA0OCA0OCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQ4IiBoZWlnaHQ9IjQ4IiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yNCAzMkMzMC42Mjc0IDMyIDM2IDE5LjI1NDggMzYgM0MzNiAxMy4yNTQ4IDMwLjYyNzQgMjIgMjQgMjJDMTcuMzcyNiAyMiAxMiAxMy4yNTQ4IDEyIDNDMTIgMTkuMjU0OCAxNy4zNzI2IDMyIDI0IDMyWiIgZmlsbD0iIzlDQTNBRiIvPgo8L3N2Zz4K';
}

// --- Lifecycle Hooks ---
onMounted(fetchWorkspaces);

onUnmounted(() => {
  for (const name in workspaces.value) {
    const workspace = workspaces.value[name];
    if (workspace.patients) {
      workspace.patients.forEach(patient => {
        patient.images.forEach(image => {
          if (image.blobUrl) URL.revokeObjectURL(image.blobUrl);
        });
      });
    }
  }
});
</script>

<style scoped>
/* Base Button */
.btn {
  @apply inline-flex items-center justify-center rounded-md border border-transparent px-4 py-2 text-sm font-medium shadow-sm transition-all duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed;
}
/* Sizes */
.btn-sm {
  @apply px-3 py-1.5 text-xs;
}
.btn-xs {
  @apply px-2 py-1 text-xs;
}
/* Variants */
.btn-primary {
  @apply bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-500;
}
.btn-danger {
  @apply bg-red-600 text-white hover:bg-red-700 focus:ring-red-500;
}
.btn-outline {
  @apply border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-indigo-500;
}
.btn-ghost {
  @apply border-transparent bg-transparent text-gray-600 hover:bg-gray-100 hover:text-gray-900 focus:ring-indigo-500;
}
.btn-ghost-danger {
   @apply border-transparent bg-transparent text-red-600 hover:bg-red-100 hover:text-red-800 focus:ring-red-500;
}
/* Icon Button Adjustments */
.btn-icon-only {
   @apply p-1.5;
}
.sm\:btn-icon-text {
   @apply sm:px-2.5 sm:py-1;
}

/* GÖRÜNTÜ KARTI LİNK BUTONLARI */
.btn-image-action {
    @apply font-medium hover:underline;
}

/* Form Elements */
.form-label { @apply block text-sm font-medium text-gray-700; }
.form-input { @apply mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm; }
.form-input-sm { @apply py-1.5 px-2.5 text-xs; }

/* Card Styles */
.card { @apply bg-white rounded-lg border border-gray-200 overflow-hidden; }
.card-header { @apply bg-gray-50 px-4 py-3 border-b border-gray-200; }
.card-body { @apply p-4; }
</style>
