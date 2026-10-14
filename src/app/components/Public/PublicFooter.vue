<script setup lang="ts">
import { PUBLIC_SECONDARY_LINKS } from "~/data/publicNavigation";
const route: ReturnType<typeof useRoute> = useRoute();
</script>
<template>
  <footer class="site-footer">
    <section class="footer-content container" aria-label="Club information">
      <p class="footer-brand">CoderDojo Ennis<span>Free coding club for ages 7+</span></p>
      <p>Free to attend. Run by volunteers.<br />In Ennis since 2012.</p>
      <nav class="footer-nav" aria-label="Footer navigation">
        <NuxtLink to="/contact">Get in touch</NuxtLink>
        <NuxtLink to="/news">Club news</NuxtLink>
        <NuxtLink v-for="link in PUBLIC_SECONDARY_LINKS" :key="link.to" :to="link.to" :aria-current="route.path === link.to ? 'page' : undefined">{{ link.label }}</NuxtLink>
      </nav>
    </section>
  </footer>
</template>
