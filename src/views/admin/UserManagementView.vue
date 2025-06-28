<template>
  <main class="px-4 py-6 sm:px-0" role="main" aria-labelledby="user-management-heading">
    <h1 id="user-management-heading" class="text-3xl font-bold text-gray-900 mb-6">
      Kullanıcı Yönetimi
    </h1>
    <p class="text-gray-700 mb-6">
      Sistemdeki tüm kullanıcıları burada görüntüleyebilir ve yönetebilirsiniz.
    </p>

    <UserList />
  </main>
</template>

<script setup>
import UserList from '@/components/admin/UserList.vue'
</script>

<style scoped>
/* UserManagementView'e özel stiller buraya eklenebilir */
</style>
