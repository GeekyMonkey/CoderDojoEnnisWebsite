<script setup lang="ts">
import PublicNavigation from "./PublicNavigation.vue";
</script>
<template>
  <header class="site-header">
    <section class="header-top container" aria-label="Club identity">
      <NuxtLink class="brand" to="/" aria-label="CoderDojo Ennis home">
        <img class="brand-logo" src="/images/Logos/Logo.png" alt="" />
        <span class="brand-name">CoderDojo <span class="brand-place">Ennis, Ireland</span></span>
      </NuxtLink>
      <NuxtLink class="button button-small button-outline" to="/login">Member sign-in <span aria-hidden="true">→</span></NuxtLink>
    </section>
    <PublicNavigation />
  </header>
</template>
