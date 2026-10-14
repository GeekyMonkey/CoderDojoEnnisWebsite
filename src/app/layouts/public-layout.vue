<script setup lang="ts">
import PublicHeader from "~/components/Public/PublicHeader.vue";
import PublicFooter from "~/components/Public/PublicFooter.vue";
</script>
<template>
  <div class="public-site">
    <a class="skip-link" href="#main">Skip to content</a>
    <PublicHeader />
    <main id="main" class="container" tabindex="-1"><slot /></main>
    <PublicFooter />
  </div>
</template>
