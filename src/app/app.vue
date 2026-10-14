<script setup lang="ts">
import { computed, type ComputedRef } from "vue";
import applicationStyles from "~/assets/css/application.css?url";
import publicStyles from "~/assets/css/public.css?url";
import labStyles from "~/assets/css/lab.css?url";
import tidyTownsStyles from "~/assets/css/tidy-towns.css?url";
import ApplicationShell from "~/components/Application/ApplicationShell.vue";

type SiteSection = "application" | "public" | "lab" | "tidy-towns";
const SITE_STYLES: Record<SiteSection, string> = {
  application: applicationStyles, public: publicStyles, lab: labStyles, "tidy-towns": tidyTownsStyles,
};
const route: ReturnType<typeof useRoute> = useRoute();
// Select the document scope without starting application presentation on public routes.
const siteSection: ComputedRef<SiteSection> = computed<SiteSection>(() => {
  const section: unknown = route.meta.siteSection;
  return section === "public" || section === "lab" || section === "tidy-towns" ? section : "application";
});
const stylesheet: ComputedRef<string> = computed<string>(() => SITE_STYLES[siteSection.value]);
// Replace the area stylesheet link instead of accumulating global CSS on navigation.
useHead(() => ({ link: [{ key: "site-styles", rel: "stylesheet", href: stylesheet.value, "data-site-styles": siteSection.value }] }));
</script>

<template>
  <ApplicationShell v-if="siteSection === 'application'">
    <NuxtLayout><NuxtPage /></NuxtLayout>
  </ApplicationShell>
  <NuxtLayout v-else><NuxtPage /></NuxtLayout>
</template>
