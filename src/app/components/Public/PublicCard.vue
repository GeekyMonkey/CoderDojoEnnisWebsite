<script setup lang="ts">
const props: Props = withDefaults(defineProps<Props>(), { as: "article" });
type Props = { as?: "article" | "aside" };
</script>
<template><component :is="props.as" class="card"><slot /></component></template>
