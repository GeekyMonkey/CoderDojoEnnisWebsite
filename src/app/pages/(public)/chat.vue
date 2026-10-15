<script setup lang="ts">
import PublicPageIntro from "~/components/Public/PublicPageIntro.vue";
definePageMeta({ layout: "public-layout", siteSection: "public" });
useHead({ title: "Club chat | CoderDojo Ennis", meta: [{ name: "description", content: "Open the CoderDojo Ennis Lab chat room." }] });
</script>
<template><div>
<PublicPageIntro title="Club chat"><p class="lead">Continue to the CoderDojo Ennis Lab chat room.</p></PublicPageIntro>
<p><a class="button" href="https://hack.chat/?CoderDojoEnnisLab" target="_blank" rel="noopener noreferrer">Open the chat room ↗</a></p>
</div></template>
