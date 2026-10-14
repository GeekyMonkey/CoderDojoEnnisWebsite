<script setup lang="ts">
import { computed, type ComputedRef } from "vue";
import ApplicationShell from "~/components/Application/ApplicationShell.vue";

type SiteSection = "application" | "public" | "lab" | "tidy-towns";
const route: ReturnType<typeof useRoute> = useRoute();
// Select the document scope without starting application presentation on public routes.
const siteSection: ComputedRef<SiteSection> = computed<SiteSection>(() => {
  const section: unknown = route.meta.siteSection;
  return section === "public" || section === "lab" || section === "tidy-towns" ? section : "application";
});
useHead(() => ({ htmlAttrs: { "data-site-section": siteSection.value } }));
</script>

<template>
  <ApplicationShell v-if="siteSection === 'application'">
    <NuxtLayout><NuxtPage /></NuxtLayout>
  </ApplicationShell>
  <NuxtLayout v-else><NuxtPage /></NuxtLayout>
</template>
