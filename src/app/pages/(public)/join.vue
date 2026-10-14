<script setup lang="ts">
import PublicCallToAction from "~/components/Public/PublicCallToAction.vue";
import PublicCard from "~/components/Public/PublicCard.vue";
import PublicPageIntro from "~/components/Public/PublicPageIntro.vue";
definePageMeta({ layout: "public-layout", siteSection: "public" });
useHead({ title: "Join the club | CoderDojo Ennis", meta: [{ name: "description", content: "Find out how young people aged 7 and up can join CoderDojo Ennis, or volunteer your time and skills." }] });
</script>

<template>
<div>

<PublicPageIntro title="Join the club">
<p class="lead">
					You can join from age 7. You need basic reading and computer skills,
					but you don’t need to know how to code.
				</p>
</PublicPageIntro>
<section class="content-grid">
<article class="prose">
<h2>How to join</h2>
<ol class="steps">
<li>
<h3>Fill in the waiting-list form</h3>
<p>
								Ask a parent to help you fill in the form. We’ll contact you
								when there’s a place.
							</p>
<a class="button" href="https://docs.google.com/forms/d/1kh7WkqYj6SIjOg4rRgzx9Q-4GTi4Or8ed6dRCUaACzM/viewform?usp=send_form">Join the waiting list ↗</a>
</li>
<li>
<h3>Check your email</h3>
<p>
								When there’s a place, we’ll email you a start date and explain
								how to sign up.
							</p>
</li>
<li>
<h3>Bring your laptop</h3>
<p>
								Bring a laptop if you have one. If you need to use a club
								computer, ask us before you come.
							</p>
</li>
</ol>
</article>
<PublicCard as="aside" class="card-accent">
<h2>Good to know</h2>
<ul class="check-list">
<li>Sessions are free.</li>
<li>No coding experience needed.</li>
<li>Parents of children aged 12 and under must stay.</li>
<li>Parents are welcome to learn too.</li>
</ul>
<p>Wait for your invitation before coming to your first session.</p>
<NuxtLink class="text-link" to="/visit">When and where we meet →</NuxtLink>
</PublicCard>
</section>
<PublicCallToAction>
<h2>Help at the club</h2>
<p>
						Adults can help with coding, art, paperwork, or looking after the
						group. You don’t need to be a programmer.
					</p>
<p>
						Email us to tell us how you’d like to help. Everyone who runs the
						club is a volunteer.
					</p>
<template #action>
<a class="button" href="mailto:enniscoderdojo@gmail.com?subject=Volunteering%20at%20CoderDojo%20Ennis">Email the club ↗</a>
</template></PublicCallToAction>

</div>
</template>
