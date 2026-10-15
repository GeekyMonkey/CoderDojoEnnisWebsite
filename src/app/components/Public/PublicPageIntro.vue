<script setup lang="ts">
const props: Props = defineProps<Props>();
type Props = { title: string };
</script>
<template><header class="page-intro"><h1>{{ props.title }}</h1><slot /></header></template>
