<script setup lang="ts">
const props: Props = defineProps<Props>();
type Props = { title: string; src: string; fallbackUrl: string; fallbackLabel: string };
</script>
<template>
  <div><iframe class="embed" :title="props.title" :src="props.src" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>
  <p><a :href="props.fallbackUrl">{{ props.fallbackLabel }} ↗</a></p></div>
</template>
