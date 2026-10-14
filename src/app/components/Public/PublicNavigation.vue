<script setup lang="ts">
import { PUBLIC_PRIMARY_LINKS } from "~/data/publicNavigation";
const route: ReturnType<typeof useRoute> = useRoute();
</script>
<template>
  <nav class="site-nav container" aria-label="Main navigation">
    <ul><li v-for="link in PUBLIC_PRIMARY_LINKS" :key="link.to">
      <NuxtLink :to="link.to" :aria-current="route.path === link.to ? 'page' : undefined">{{ link.label }}</NuxtLink>
    </li></ul>
  </nav>
</template>
