<script setup lang="ts">
import PublicCard from "~/components/Public/PublicCard.vue";
import PublicPageIntro from "~/components/Public/PublicPageIntro.vue";
definePageMeta({ layout: "public-layout", siteSection: "public" });
useHead({ title: "Contact us | CoderDojo Ennis", meta: [{ name: "description", content: "Contact CoderDojo Ennis by email or through our existing social channels." }] });
</script>

<template>
<div>

<PublicPageIntro title="Contact us">
<p class="lead">
					Got a question about joining, a session, or helping out? Send us a
					message.
				</p>
</PublicPageIntro>
<section class="card-grid card-grid-two">
<PublicCard class="card-accent">
<h2>Email the club</h2>
<p>Send your question to:</p>
<a class="contact-link" href="mailto:enniscoderdojo@gmail.com">enniscoderdojo@gmail.com</a>
</PublicCard>
<PublicCard class="">
<h2>Find us online</h2>
<p>You can also message us on Facebook.</p>
<ul class="resource-list">
<li>
<a href="https://www.facebook.com/CoderDojoEnnis">CoderDojo Ennis on Facebook ↗</a>
</li>
</ul>
</PublicCard>
</section>
<section class="link-strip">
<h2>Joining for the first time?</h2>
<p>
<NuxtLink to="/join">Find out how to join</NuxtLink> and
					<NuxtLink to="/visit">plan your visit</NuxtLink>.
				</p>
</section>

</div>
</template>
