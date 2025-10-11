<template>
  <main class="py-6 px-4 max-w-3xl mx-auto space-y-8">
    <UserProfile />
    <ChangePasswordForm />
  </main>
</template>

<script setup>
import UserProfile from '@/modules/user/components/UserProfile.vue'
import ChangePasswordForm from '@/modules/user/components/ChangePasswordForm.vue'
</script>
