<script setup lang="ts">
import PublicCard from "./PublicCard.vue";
const props: Props = defineProps<Props>();
type Props = { title: string; href: string; image: string };
</script>
<template>
  <PublicCard>
    <img class="gift-image" :src="props.image" :alt="props.title" loading="lazy" />
    <h2>{{ props.title }}</h2><slot />
    <a class="text-link" :href="props.href" target="_blank" rel="noopener noreferrer">View original product link ↗</a>
  </PublicCard>
</template>
