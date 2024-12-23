<template>
  <div class="space-y-8">
    <AppSettingsUpdateProfile :user />
    <AppSettingsUpdatePassword />
    <AppSettingsPasskeyManager />
    <AppSettingsManageLinkedAccounts />
  </div>
</template>

<script setup>
const { user } = useUserSession();
</script>
