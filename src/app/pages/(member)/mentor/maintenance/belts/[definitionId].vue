<script setup lang="ts">
 import { computed, type ComputedRef } from "vue";
 const route: ReturnType<typeof useRoute> = useRoute();
 const definitionId: ComputedRef<string> = computed((): string => String(route.params.definitionId ?? ""));
</script>
<template><DefinitionDetail :key="definitionId" kind="belt" :definitionId="definitionId" /></template>
