<script setup lang="ts">
 import { computed, type ComputedRef } from "vue";
 import SessionEditorPage from "~/components/Sessions/SessionEditorPage.vue";
 const route: ReturnType<typeof useRoute> = useRoute();
 const sessionId: ComputedRef<string> = computed((): string => String((route.params as Record<string, string | string[]>).sessionId ?? ""));
</script>
<template><SessionEditorPage :key="sessionId" :sessionId="sessionId" /></template>
