<script setup lang="ts">
 const props = defineProps<{title:string|null;open?:boolean}>();
</script>
<template><details v-if="title" :open="open ?? false" class="CollapsibleSection"><summary>{{ title }}</summary><div class="SectionBody"><slot /></div></details><div v-else class="SectionBody"><slot /></div></template>
<style scoped lang="scss">summary {cursor:pointer;font-weight:600;padding:calc(var(--spacing)*3);border-bottom:1px solid var(--ui-border);} .SectionBody {display:grid;gap:calc(var(--spacing)*3);min-width:0;} details>.SectionBody {padding:calc(var(--spacing)*3);}</style>
