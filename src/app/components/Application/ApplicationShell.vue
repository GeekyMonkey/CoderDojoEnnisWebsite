<script setup lang="ts">
import { ACTION_TOASTER } from "~/utils/actionNotificationPolicy";
useUiConfig();
</script>

<template>
  <UApp :toaster="ACTION_TOASTER">
    <ActionNotificationPresenter />
    <NuxtLoadingIndicator />
    <slot />
  </UApp>
  <ThemeFooter />
</template>
