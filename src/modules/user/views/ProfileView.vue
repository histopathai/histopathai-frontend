<template>
  <main class="py-6 px-4 max-w-3xl mx-auto space-y-8">
    <UserProfile />
    <ChangePasswordForm />
  </main>
</template>

<script setup>
import UserProfile from '@/presentation/components/user/UserProfile.vue'
import ChangePasswordForm from '@/modules/user/components/ChangePasswordForm.vue'
</script>
