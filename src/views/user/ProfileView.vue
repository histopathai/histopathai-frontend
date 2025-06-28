<template>
  <main class="py-6 px-4 max-w-3xl mx-auto space-y-8">
    <UserProfile />
    <ChangePasswordForm />
  </main>
</template>

<script setup>
import UserProfile from '@/components/user/UserProfile.vue'
import ChangePasswordForm from '@/components/user/ChangePasswordForm.vue'
</script>
