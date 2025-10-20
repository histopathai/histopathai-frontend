<template>
  <div class="p-8">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-3xl font-bold text-gray-900">Çalışma Alanlarım</h1>
      <button @click="isCreateModalOpen = true" class="btn btn-primary">
        Yeni Çalışma Alanı Oluştur
      </button>
    </div>

    <CreateWorkspaceModal :is-open="isCreateModalOpen" @close="isCreateModalOpen = false" @created="handleWorkspaceCreated" />
    <ImageUploadModal :is-open="isUploadModalOpen" :workspace-name="selectedWorkspace" :organ-type="selectedWorkspaceOrgan" @close="isUploadModalOpen = false" @uploaded="handleImageUploaded" />
    <DeleteWorkspaceModal :is-open="isDeleteModalOpen" :workspace-name="workspaceToDelete" @close="closeDeleteModal" @confirm="executeDeleteWorkspace" />
    <EditWorkspaceModal :is-open="isEditModalOpen" :initial-data="workspaceToEdit" @close="isEditModalOpen = false" @updated="handleWorkspaceUpdated" />
    <WSIViewerModal :is-open="isViewerModalOpen" :image="imageToView" @close="isViewerModalOpen = false" />
    <DeleteImageModal :is-open="isDeleteImageModalOpen" :image-name="imageToDelete ? imageToDelete.file_name : ''" :workspace-name="workspaceOfImageToDelete" @close="isDeleteImageModalOpen = false" @confirm="executeDeleteImage" />
    <EditImageModal
      :is-open="isEditImageModalOpen"
      :initial-data="imageToEdit"
      @close="isEditImageModalOpen = false"
      @updated="handleImageUpdated"
    />

    <div v-if="isFilterAreaVisible" class="mb-6 p-4 bg-gray-50 rounded-lg shadow-sm">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div><label for="filterName" class="form-label text-sm">Ada Göre Ara</label><input type="text" id="filterName" v-model="filters.name" class="form-input form-input-sm" placeholder="İsim içerir..."></div>
        <div><label for="filterOrgan" class="form-label text-sm">Organ Tipi</label><select id="filterOrgan" v-model="filters.organType" class="form-input form-input-sm"><option value="">Tüm Organlar</option><option v-for="organ in uniqueOrganTypes" :key="organ" :value="organ">{{ organ }}</option></select></div>
        <div><label for="filterOrg" class="form-label text-sm">Kurum</label><select id="filterOrg" v-model="filters.organization" class="form-input form-input-sm"><option value="">Tüm Kurumlar</option><option v-for="org in uniqueOrganizations" :key="org" :value="org">{{ org }}</option></select></div>
        <div><label for="filterYear" class="form-label text-sm">Yıl</label><input type="text" id="filterYear" v-model="filters.releaseYear" class="form-input form-input-sm" placeholder="Örn: 2025"></div>
      </div>
      <div class="mt-4 flex justify-end"><button @click="resetFilters" class="btn btn-outline btn-sm">Filtreleri Temizle</button></div>
    </div>
    <div v-if="loading" class="text-center py-10"><p>Çalışma alanları yükleniyor...</p></div>
    <div v-else-if="error" class="text-red-500 text-center py-10"><p>{{ error }}</p></div>
    <div v-else-if="Object.keys(workspaces).length === 0" class="text-center py-10 text-gray-500"><p>Henüz bir çalışma alanı oluşturmadınız.</p></div>
    <div v-else-if="Object.keys(filteredWorkspaces).length === 0" class="text-center py-10 text-gray-500"><p>Filtre kriterlerinize uygun bir çalışma alanı bulunamadı.</p></div>

    <div v-else class="space-y-6">
      <div v-for="(workspace, name) in filteredWorkspaces" :key="name" class="card">
        <div class="card-header flex justify-between items-center">
          <div><h2 class="text-xl font-semibold">{{ name }}</h2><div v-if="workspace.details" class="flex items-center gap-3 text-sm text-gray-600 mt-1"><span><strong>Organ:</strong> {{ workspace.details.organType || 'Bilinmiyor' }}</span><span>|</span><span><strong>Kurum:</strong> {{ workspace.details.organization || 'Bilinmiyor' }}</span></div></div>
          <div class="flex gap-2"><button @click="promptEditWorkspace(name)" class="btn btn-outline btn-sm">Düzenle</button><button @click="openUploadModal(name)" class="btn btn-outline btn-sm">Görüntü Yükle</button><button @click="promptDeleteWorkspace(name)" class="btn btn-danger btn-sm">Çalışma Alanını Sil</button></div>
        </div>

        <div class="card-body">
          <div v-if="workspace.images.length === 0" class="text-gray-500">Bu çalışma alanında henüz görüntü yok.</div>
          <div v-else class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
            <div v-for="image in workspace.images" :key="image.id" class="border rounded-lg overflow-hidden shadow-sm">
               <img :src="getThumbnailUrl(image)" :alt="image.file_name" class="w-full h-24 object-cover bg-gray-200" @error="handleImageError">
               <div class="p-1.5 text-xs">
                  <p class="font-semibold truncate">{{ image.file_name }}</p>
                  <p class="text-gray-600 truncate">{{ image.disease_type || 'Teşhis Yok' }}</p>
                  <p class="text-gray-600 truncate">{{ image.sub_type || 'Tip Yok' }}</p>
                  <div class="mt-1 flex justify-end gap-2">
                     <button @click="viewImage(image)" class="text-blue-500 hover:underline">Görüntüle</button>
                     <button @click="promptEditImage(image)" class="text-green-600 hover:underline">Düzenle</button>
                     <button @click="promptDeleteImage(image, name)" class="text-red-500 hover:underline">Sil</button>
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
import CreateWorkspaceModal from '../components/CreateWorkspaceModal.vue';
import ImageUploadModal from '../components/ImageUploadModal.vue';
import DeleteWorkspaceModal from '../components/DeleteWorkspaceModal.vue';
import EditWorkspaceModal from '../components/EditWorkspaceModal.vue';
import WSIViewerModal from '../components/ViewerModal.vue';
import DeleteImageModal from '../components/DeleteImageModal.vue';
// YENİ MODAL IMPORT EDİLDİ
import EditImageModal from '../components/EditImageModal.vue';

const router = useRouter();
const toast = useToast();

const workspaces = ref({});
const loading = ref(true);
const error = ref(null);

// Modal Durumları
const isCreateModalOpen = ref(false);
const isUploadModalOpen = ref(false);
const selectedWorkspace = ref('');
const selectedWorkspaceOrgan = ref('');
const isDeleteModalOpen = ref(false);
const workspaceToDelete = ref('');
const isEditModalOpen = ref(false);
const workspaceToEdit = ref(null);
const isViewerModalOpen = ref(false);
const imageToView = ref(null);
const isDeleteImageModalOpen = ref(false);
const imageToDelete = ref(null);
const workspaceOfImageToDelete = ref('');
// YENİ: Görüntü Düzenleme Modal'ı için ref'ler
const isEditImageModalOpen = ref(false);
const imageToEdit = ref(null);

const originalWorkspaceNameToEdit = ref('');

const isFilterAreaVisible = ref(false);
const filters = reactive({ name: '', organType: '', organization: '', releaseYear: '' });
const uniqueOrganTypes = computed(() => { const allTypes = Object.values(workspaces.value).map(ws => ws.details?.organType).filter(Boolean); return [...new Set(allTypes)].sort(); });
const uniqueOrganizations = computed(() => { const allOrgs = Object.values(workspaces.value).map(ws => ws.details?.organization).filter(Boolean); return [...new Set(allOrgs)].sort(); });
const filteredWorkspaces = computed(() => { const allWorkspaces = workspaces.value; const nameQuery = filters.name.toLowerCase().trim(); const organQuery = filters.organType.toLowerCase(); const orgQuery = filters.organization.toLowerCase(); const yearQuery = String(filters.releaseYear).trim(); if (!nameQuery && !organQuery && !orgQuery && !yearQuery) { return allWorkspaces; } const filtered = {}; for (const [name, workspace] of Object.entries(allWorkspaces)) { const details = workspace.details; if (!details) continue; const nameMatch = nameQuery ? name.toLowerCase().includes(nameQuery) : true; const organMatch = organQuery ? (details.organType || '').toLowerCase() === organQuery : true; const orgMatch = orgQuery ? (details.organization || '').toLowerCase() === orgQuery : true; const yearMatch = yearQuery ? String(details.releaseYear || '').includes(yearQuery) : true; if (nameMatch && organMatch && orgMatch && yearMatch) { filtered[name] = workspace; } } return filtered; });
const resetFilters = () => { filters.name = ''; filters.organType = ''; filters.organization = ''; filters.releaseYear = ''; };
const closeDeleteModal = () => { isDeleteModalOpen.value = false; setTimeout(() => { workspaceToDelete.value = ''; }, 300); };
const fetchWorkspaces = async () => { loading.value = true; error.value = null; try { if (Object.keys(workspaces.value).length > 0) { loading.value = false; return; } const images = []; workspaces.value = images.reduce((acc, image) => { /*...*/ }, {}); } catch (err) { if(err.response?.status !== 404) { error.value = 'Çalışma alanları yüklenirken bir hata oluştu.'; toast.error(error.value); } workspaces.value = {}; } finally { loading.value = false; } };
const handleWorkspaceCreated = (workspaceData) => { const name = workspaceData.name; if (!workspaces.value[name]) { workspaces.value[name] = { details: workspaceData, images: [] }; } isCreateModalOpen.value = false; toast.success(`'${name}' çalışma alanı oluşturuldu!`); };
const openUploadModal = (name) => { selectedWorkspace.value = name; if (workspaces.value[name] && workspaces.value[name].details) { selectedWorkspaceOrgan.value = workspaces.value[name].details.organType; } isUploadModalOpen.value = true; };
const handleImageUploaded = (fakeImage) => { isUploadModalOpen.value = false; if (fakeImage && fakeImage.dataset_name) { const workspaceName = fakeImage.dataset_name; if (workspaces.value[workspaceName]) { workspaces.value[workspaceName].images.push(fakeImage); toast.success(`'${fakeImage.file_name}' görüntüsü eklendi!`); } } else { toast.error('Görüntü eklenirken bir sorun oluştu.'); } };
const promptEditWorkspace = (workspaceName) => { const workspace = workspaces.value[workspaceName]; if (workspace && workspace.details) { originalWorkspaceNameToEdit.value = workspaceName; workspaceToEdit.value = { ...workspace.details }; isEditModalOpen.value = true; } else { toast.error('Bu çalışma alanının detayları bulunamadı.'); } };
const handleWorkspaceUpdated = (updatedData) => { const originalName = originalWorkspaceNameToEdit.value; const newName = updatedData.name; if (!workspaces.value[originalName]) { toast.error('Güncellenecek orijinal çalışma alanı bulunamadı.'); return; } if (originalName === newName) { workspaces.value[originalName].details = updatedData; } else { if (workspaces.value[newName]) { toast.error(`'${newName}' adında başka bir çalışma alanı zaten mevcut.`); return; } workspaces.value[newName] = { ...workspaces.value[originalName] }; workspaces.value[newName].details = updatedData; delete workspaces.value[originalName]; } isEditModalOpen.value = false; toast.success(`'${newName}' çalışma alanı güncellendi.`); originalWorkspaceNameToEdit.value = ''; };
const promptDeleteWorkspace = (workspaceName) => { workspaceToDelete.value = workspaceName; isDeleteModalOpen.value = true; };
const executeDeleteWorkspace = async () => { const workspaceName = workspaceToDelete.value; try { const workspace = workspaces.value[workspaceName]; if (workspace && workspace.images) { workspace.images.forEach(image => { if (image.blobUrl) URL.revokeObjectURL(image.blobUrl); }); } delete workspaces.value[workspaceName]; toast.success(`'${workspaceName}' çalışma alanı başarıyla silindi.`); } catch (err) { toast.error('Çalışma alanı silinirken bir hata oluştu.', { timeout: 3000 }); console.error(err); } finally { closeDeleteModal(); } };
const promptDeleteImage = (image, workspaceName) => { imageToDelete.value = image; workspaceOfImageToDelete.value = workspaceName; isDeleteImageModalOpen.value = true; };
const executeDeleteImage = async () => { const imageId = imageToDelete.value.id; const workspaceName = workspaceOfImageToDelete.value; try { if (workspaces.value[workspaceName]) { const images = workspaces.value[workspaceName].images; const index = images.findIndex(img => img.id === imageId); if (index > -1) { const imageToRevoke = images[index]; if (imageToRevoke.blobUrl) URL.revokeObjectURL(imageToRevoke.blobUrl); images.splice(index, 1); toast.success('Görüntü başarıyla silindi.'); } } } catch (err) { toast.error('Görüntü silinirken bir hata oluştu.', { timeout: 3000 }); } finally { isDeleteImageModalOpen.value = false; imageToDelete.value = null; workspaceOfImageToDelete.value = ''; } }

// YENİ FONKSİYONLAR: Görüntü Düzenleme
const promptEditImage = (image) => {
  // Düzenlenecek veriyi ayarlarken bir kopyasını oluşturuyoruz
  // Bu sayede "İptal" butonuna basıldığında orijinal veri bozulmaz
  imageToEdit.value = { ...image };
  isEditImageModalOpen.value = true;
};

const handleImageUpdated = (updatedImageData) => {
  const workspaceName = updatedImageData.dataset_name;
  if (!workspaceName || !workspaces.value[workspaceName]) {
    toast.error('Görüntü güncellenirken bir hata oluştu: Çalışma alanı bulunamadı.');
    return;
  }

  const images = workspaces.value[workspaceName].images;
  const imageIndex = images.findIndex(img => img.id === updatedImageData.id);

  if (imageIndex > -1) {
    // Bulunan görüntünün verisini modal'dan gelen güncel veriyle değiştir
    images[imageIndex] = updatedImageData;
    toast.success(`'${updatedImageData.file_name}' görüntüsü güncellendi.`);
  } else {
    toast.error('Güncellenecek görüntü bulunamadı.');
  }

  isEditImageModalOpen.value = false; // Modal'ı kapat
};

const viewImage = (image) => { imageToView.value = image; isViewerModalOpen.value = true; }
const getThumbnailUrl = (image) => { if (image.blobUrl) return image.blobUrl; if (String(image.id).startsWith('fake-')) return 'https.via.placeholder.com/200x150/EBF4FF/808080?text=Thumbnail'; return imageCatalogAPI.getThumbnailUrl(image.id); }
const handleImageError = (event) => { event.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIHZpZXdCb3g9IjAgMCA0OCA0OCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQ4IiBoZWlnaHQ9IjQ4IiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yNCAzMkMzMC42Mjc0IDMyIDM2IDE5LjI1NDggMzYgM0MzNiAxMy4yNTQ4IDMwLjYyNzQgMjIgMjQgMjJDMTcuMzcyNiAyMiAxMiAxMy4yNTQ4IDEyIDNDMTIgMTkuMjU0OCAxNy4zNzI2IDMyIDI0IDMyWiIgZmlsbD0iIzlDQTNBRiIvPgo8L3N2Zz4K' }
onMounted(fetchWorkspaces);
onUnmounted(() => { for (const name in workspaces.value) { const workspace = workspaces.value[name]; if (workspace.images) { workspace.images.forEach(image => { if (image.blobUrl) URL.revokeObjectURL(image.blobUrl); }); } } });
</script>
