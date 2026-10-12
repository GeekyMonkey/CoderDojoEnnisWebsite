<script setup lang="ts">
import { useKioskStore } from "~/stores/useKioskStore";

definePageMeta({ layout: "auth-layout" });
const kiosk: ReturnType<typeof useKioskStore> = useKioskStore();
const route: ReturnType<typeof useRoute> = useRoute();
const { t } = useI18n();
const errorMessage: Ref<string | null> = ref(null);
/** Remove mentor authority before loading the shared sign-in page. */
onMounted(async (): Promise<void> => {
 try {
  await kiosk.start();
  const query: string = route.query.qr ? `?qr=${encodeURIComponent(String(route.query.qr))}` : "";
  globalThis.location.replace(`/kiosk/sign-in${query}`);
 } catch { errorMessage.value = t("signIn.kioskStartError"); }
});
</script>
<template>
 <div><UAlert v-if="errorMessage" color="error" :title="errorMessage" /><UButton to="/login">{{ $t("signIn.signInButton") }}</UButton></div>
</template>
