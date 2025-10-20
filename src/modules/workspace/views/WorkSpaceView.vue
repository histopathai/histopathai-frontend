<template>
  <div class="p-8">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-3xl font-bold text-gray-900">Çalışma Alanlarım</h1>
      <button @click="isCreateModalOpen = true" class="btn btn-primary">
        Yeni Çalışma Alanı Oluştur
      </button>
    </div>

    <CreateWorkspaceModal
      :is-open="isCreateModalOpen"
      @close="isCreateModalOpen = false"
      @created="handleWorkspaceCreated"
    />

    <ImageUploadModal
      :is-open="isUploadModalOpen"
      :workspace-name="selectedWorkspace"
      @close="isUploadModalOpen = false"
      @uploaded="handleImageUploaded"
    />

    <div v-if="loading" class="text-center py-10">
      <p>Çalışma alanları yükleniyor...</p>
    </div>
    <div v-else-if="error" class="text-red-500 text-center py-10">
      <p>{{ error }}</p>
    </div>
    <div v-else-if="Object.keys(workspaces).length === 0" class="text-center py-10 text-gray-500">
      <p>Henüz bir çalışma alanı oluşturmadınız.</p>
    </div>
    <div v-else class="space-y-6">
      <div v-for="(images, name) in workspaces" :key="name" class="card">
        <div class="card-header flex justify-between items-center">
          <h2 class="text-xl font-semibold">{{ name }}</h2>
          <div class="flex gap-2">
            <button @click="openUploadModal(name)" class="btn btn-outline btn-sm">Görüntü Yükle</button>
            <button @click="deleteWorkspace(name)" class="btn btn-danger btn-sm">Çalışma Alanını Sil</button>
          </div>
        </div>
        <div class="card-body">
          <div v-if="images.length === 0" class="text-gray-500">Bu çalışma alanında henüz görüntü yok.</div>
          <div v-else class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <div v-for="image in images" :key="image.id" class="border rounded-lg overflow-hidden">
               <img :src="getThumbnailUrl(image.id)" :alt="image.file_name" class="w-full h-32 object-cover bg-gray-200" @error="handleImageError">
               <div class="p-2 text-sm">
                  <p class="font-semibold truncate">{{ image.file_name }}</p>
                  <p class="text-gray-600">{{ image.organ_type }}</p>
                  <div class="mt-2 flex justify-end gap-2">
                     <button @click="viewImage(image)" class="text-blue-500 hover:underline">Görüntüle</button>
                     <button @click="deleteImage(image.id, name)" class="text-red-500 hover:underline">Sil</button>
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
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useToast } from 'vue-toastification';
import imageCatalogAPI from '@/api/image_catalog.js';
import CreateWorkspaceModal from '../components/CreateWorkspaceModal.vue';
import ImageUploadModal from '../components/ImageUploadModal.vue';

const router = useRouter();
const toast = useToast();

const workspaces = ref({});
const loading = ref(true);
const error = ref(null);

const isCreateModalOpen = ref(false);
const isUploadModalOpen = ref(false);
const selectedWorkspace = ref('');

const fetchWorkspaces = async () => {
  loading.value = true;
  error.value = null;
  try {
    const response = await imageCatalogAPI.getImages();
    const images = response.data?.images || [];

    // Görüntüleri dataset_name'e göre grupla
    const grouped = images.reduce((acc, image) => {
      const workspaceName = image.dataset_name || 'Uncategorized';
      if (!acc[workspaceName]) {
        acc[workspaceName] = [];
      }
      acc[workspaceName].push(image);
      return acc;
    }, {});
    workspaces.value = grouped;

  } catch (err) {
    if(err.response?.status !== 404) { // 404'ü hata olarak gösterme, boş demek olabilir
      error.value = 'Çalışma alanları yüklenirken bir hata oluştu.';
      toast.error(error.value);
    }
    workspaces.value = {}; // Hata durumunda veya 404'te boşalt
  } finally {
    loading.value = false;
  }
};

const handleWorkspaceCreated = (name) => {
  if (!workspaces.value[name]) {
    workspaces.value[name] = [];
  }
  isCreateModalOpen.value = false;
  toast.success(`'${name}' çalışma alanı oluşturuldu!`);
};

const openUploadModal = (workspaceName) => {
  selectedWorkspace.value = workspaceName;
  isUploadModalOpen.value = true;
};

const handleImageUploaded = () => {
  isUploadModalOpen.value = false;
  toast.success('Görüntü işlenmek üzere gönderildi. Kısa süre içinde listenizde görünecektir.');
  // Birkaç saniye sonra listeyi yenile
  setTimeout(fetchWorkspaces, 5000);
};

const deleteWorkspace = async (workspaceName) => {
    if (!confirm(`'${workspaceName}' çalışma alanını ve içindeki tüm görüntüleri silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.`)) {
        return;
    }
    try {
        const imagesToDelete = workspaces.value[workspaceName];
        // Tüm silme işlemlerinin bitmesini bekle
        await Promise.all(imagesToDelete.map(img => imageCatalogAPI.deleteImage(img.id)));

        toast.success(`'${workspaceName}' çalışma alanı başarıyla silindi.`);
        fetchWorkspaces(); // Listeyi yenile
    } catch (err) {
        toast.error('Çalışma alanı silinirken bir hata oluştu.');
        console.error(err);
    }
};

const deleteImage = async (imageId, workspaceName) => {
     if (!confirm(`Bu görüntüyü silmek istediğinizden emin misiniz?`)) {
        return;
    }
    try {
        await imageCatalogAPI.deleteImage(imageId);
        toast.success('Görüntü başarıyla silindi.');
        fetchWorkspaces(); // Listeyi yenile
    } catch (err) {
        toast.error('Görüntü silinirken bir hata oluştu: ' + (err.response?.data?.message || err.message));
    }
}

const viewImage = (image) => {
  // WSI Viewer'a yönlendirme yap (gerekirse query veya params ile image id gönder)
  // Bu kısım ImageViewer'ın nasıl çalıştığına bağlı olarak değişebilir.
  // Şimdilik sadece yönlendirme yapıyoruz.
  router.push('/wsi-viewer');
  // Not: ImageViewer'ın bu görüntüyü otomatik olarak seçmesi için ek mantık gerekebilir.
  // Örneğin: Pinia store veya route query kullanarak.
}

const getThumbnailUrl = (imageId) => {
    // Bu fonksiyonun gerçek URL'i döndürmesi için imageCatalogAPI'ye eklenmesi gerekebilir.
    // Şimdilik placeholder kullanıyoruz.
    return imageCatalogAPI.getThumbnailUrl(imageId);
}

const handleImageError = (event) => {
      event.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIHZpZXdCb3g9IjAgMCA0OCA0OCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQ4IiBoZWlnaHQ9IjQ4IiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yNCAzMkMzMC42Mjc0IDMyIDM2IDE5LjI1NDggMzYgM0MzNiAxMy4yNTQ4IDMwLjYyNzQgMjIgMjQgMjJDMTcuMzcyNiAyMiAxMiAxMy4yNTQ4IDEyIDNDMTIgMTkuMjU0OCAxNy4zNzI2IDMyIDI0IDMyWiIgZmlsbD0iIzlDQTNBRiIvPgo8L3N2Zz4K'
}

onMounted(fetchWorkspaces);
</script>
