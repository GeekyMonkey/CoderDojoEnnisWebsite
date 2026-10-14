<script setup lang="ts">
import PublicCallToAction from "~/components/Public/PublicCallToAction.vue";
import PublicCard from "~/components/Public/PublicCard.vue";
import PublicDonationForm from "~/components/Public/PublicDonationForm.vue";
import PublicPageIntro from "~/components/Public/PublicPageIntro.vue";
import PublicSupporters from "~/components/Public/PublicSupporters.vue";
definePageMeta({ layout: "public-layout", siteSection: "public" });
useHead({ title: "About the club | CoderDojo Ennis", meta: [{ name: "description", content: "A free, volunteer-led community where young people in Ennis learn to code, create, and share." }] });
</script>

<template>
<div>

<PublicPageIntro title="About CoderDojo Ennis">
<p class="lead">
					CoderDojo Ennis is a free coding club for kids aged 7 and up. You can
					make things, learn new skills, and meet other coders.
				</p>
</PublicPageIntro>
<section class="content-grid">
<article class="prose">
<h2>What we do</h2>
<p>
						CoderDojo clubs run around the world. Our Ennis club started in
						March 2012. We make games, websites, animations, and electronics
						projects.
					</p>
<p>
						If you’re new to coding, Scratch is a good place to start. Mentors
						help you learn how to use it and try other tools when you’re ready.
					</p>
<h2>Working in teams</h2>
<p>
						You can work with other kids on a project. Some people code, some
						draw, and some come up with ideas. You can try different jobs.
					</p>
<p>
						At show-and-tell, you can show the group what you’ve made. You don’t
						have to, and your project doesn’t have to be finished.
					</p>
</article>
<PublicCard as="aside" class="card-accent">
<p class="eyebrow">Our one rule</p>
<h2>Above all: be cool.</h2>
<p>Be kind, listen to each other, and help out when you can.</p>
<NuxtLink class="text-link" to="/visit">Plan your first visit →</NuxtLink>
</PublicCard>
</section>
<section aria-labelledby="supporters-title" class="section-block">
<header class="section-heading">
<h2 id="supporters-title">Our supporters</h2>
<p>These people and organisations help us run the club for free.</p>
</header>
<PublicSupporters></PublicSupporters>
</section>
<PublicCallToAction>
<h2>Help pay for club equipment</h2>
<p>Donations help pay for equipment and running the club.</p>
<template #action>
<PublicDonationForm></PublicDonationForm>
</template></PublicCallToAction>

</div>
</template>
