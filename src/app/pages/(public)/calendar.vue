<script setup lang="ts">
import SessionCalendar from "~/components/Sessions/SessionCalendar.vue";
import PublicPageIntro from "~/components/Public/PublicPageIntro.vue";

definePageMeta({ layout: "public-layout", siteSection: "public" });
useHead({
  title: "Calendar | CoderDojo Ennis",
  meta: [{ name: "description", content: "Upcoming and past CoderDojo Ennis sessions. Check the calendar before planning your visit." }],
});
</script>

<template>
  <div>
    <PublicPageIntro title="Session calendar">
      <p class="lead">See upcoming and past sessions, and check dates before you come.</p>
    </PublicPageIntro>
    <section class="section-block">
      <SessionCalendar />
    </section>
  </div>
</template>
