<script setup lang="ts">
 import { computed, type ComputedRef } from "vue";
 const route: ReturnType<typeof useRoute> = useRoute();
 const teamId: ComputedRef<string> = computed((): string => String(route.params.teamId ?? ""));
</script>
<template><TeamDetail :key="teamId" :teamId="teamId" /></template>
