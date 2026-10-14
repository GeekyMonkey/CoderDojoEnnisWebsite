<script setup lang="ts">
import PublicCard from "~/components/Public/PublicCard.vue";
import PublicEmbed from "~/components/Public/PublicEmbed.vue";
import SessionCalendar from "~/components/Sessions/SessionCalendar.vue";
import PublicPageIntro from "~/components/Public/PublicPageIntro.vue";
definePageMeta({ layout: "public-layout", siteSection: "public" });
useHead({ title: "Plan your visit | CoderDojo Ennis", meta: [{ name: "description", content: "Session times, calendar, location, and first-visit information for CoderDojo Ennis at CBS Primary School." }] });
</script>

<template>
<div>

<PublicPageIntro title="When and where we meet">
<p class="lead">
					We meet at CBS Primary School in Ennis on Saturdays during term time.
					Check the calendar before you come.
				</p>
</PublicPageIntro>
<section class="card-grid card-grid-two">
<PublicCard class="">
<p class="eyebrow">When</p>
<h2>Saturdays, 10am–12pm</h2>
<p>
						During term time, except bank holiday weekends. Beginner and
						advanced groups start together.
					</p>
<a class="text-link" href="#session-calendar">See upcoming sessions →</a>
</PublicCard>
<PublicCard class="">
<p class="eyebrow">Where</p>
<h2>CBS Primary School</h2>
<address>Ennis, County Clare, Ireland</address>
<p>
<a href="https://www.cbsennis.com/">School website ↗</a> ·
						<a href="https://www.google.com/maps/search/?api=1&amp;query=CoderDojo+Ennis+CBS+Primary+School">Get directions ↗</a>
</p>
</PublicCard>
</section>
<aside class="notice">
<h2>Before you come</h2>
<p>
					Children aged 12 and under must have a parent stay with them. Bring a
					laptop if you can; ask us about using a club computer. New to the
					dojo? <NuxtLink to="/join">Fill in the waiting-list form first.</NuxtLink>
</p>
</aside>
<section id="session-calendar" class="section-block" aria-labelledby="session-calendar-title">
<h2 id="session-calendar-title">Session calendar</h2>
<SessionCalendar />
</section>
<section class="section-block" aria-labelledby="map-title">
<h2 id="map-title">Find the dojo</h2>
<PublicEmbed fallbackLabel="Open in a new page" fallbackUrl="https://www.google.com/maps/search/?api=1&amp;query=CoderDojo+Ennis+CBS+Primary+School" src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2409.576161227536!2d-8.979294884180264!3d52.84802187987763!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x485b6dca59377aab%3A0x4ddb593bfcb08cf!2sCoderDojo+Ennis!5e0!3m2!1sen!2sie!4v1536571038270" title="Map showing CoderDojo Ennis at CBS Primary School" />
</section>
<section class="link-strip">
<h2>Looking for a closer club?</h2>
<p>
<a href="https://zen.coderdojo.com/">Find another dojo</a> that’s
					closer to you, or <NuxtLink to="/contact">ask us a question</NuxtLink>.
				</p>
</section>

</div>
</template>
