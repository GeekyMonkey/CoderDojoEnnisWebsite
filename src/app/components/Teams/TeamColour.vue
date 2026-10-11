<script setup lang="ts">
 import { computed, type ComputedRef } from "vue";
 const props = defineProps<{ hexcode: string | null }>();
 const colour: ComputedRef<string> = computed((): string => /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(props.hexcode ?? "") ? (props.hexcode ?? "var(--ui-border)") : "var(--ui-border)");
</script>
<template><svg class="TeamColour" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="10" :fill="colour" /></svg></template>
<style scoped lang="scss">.TeamColour { width: 1.5rem; height: 1.5rem; flex-shrink: 0; }</style>
