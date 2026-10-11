<script setup lang="ts">
 import { onMounted, onBeforeUnmount, watch } from "vue";
 import type { ActionNotification } from "#shared/types/ActionNotification";
 import { actionNotificationPolicy } from "~/utils/actionNotificationPolicy";
 const app: ReturnType<typeof useNuxtApp> = useNuxtApp();
 const toast: ReturnType<typeof useToast> = useToast();
 const route: ReturnType<typeof useRoute> = useRoute();
 const owned: Set<string | number> = new Set();
 /** Present one active toast per event name and message. */
 function present(event: ActionNotification): void {
  const policy: ReturnType<typeof actionNotificationPolicy> = actionNotificationPolicy(event);
  if (!policy.visible) return;
  const id: string = JSON.stringify([event.name, event.severity, event.message]);
  if (toast.toasts.value.some((item: { id: string | number }): boolean => item.id === id)) return;
  owned.add(id);
  toast.add({ id, title: event.message, color: policy.color, icon: policy.icon, duration: policy.duration, "onUpdate:open": (open: boolean): void => { if (!open) owned.delete(id); } });
 }
 /** Remove this presenter's transient messages on navigation or teardown. */
 function clear(): void { for (const id of owned) toast.remove(id); owned.clear(); }
 onMounted((): void => { app.$actionNotifications.on("action", present); });
 onBeforeUnmount((): void => { app.$actionNotifications.off("action", present); clear(); });
 watch((): string => route.path, clear);
</script>
<template><span class="ActionNotificationPresenter" aria-hidden="true" /></template>
<style scoped lang="scss">.ActionNotificationPresenter { display: none; }</style>
