<script setup lang="ts">
const props: Props = defineProps<Props>();
type Props = { year: string };
</script>
<template><aside class="notice"><p><strong>Archive · {{ props.year }}</strong></p><slot /></aside></template>
