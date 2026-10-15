<script setup lang="ts">
import PublicCallToAction from "~/components/Public/PublicCallToAction.vue";
import PublicCard from "~/components/Public/PublicCard.vue";
definePageMeta({ layout: "public-layout", siteSection: "public" });
useHead({ title: "Free coding club | CoderDojo Ennis", meta: [{ name: "description", content: "Free coding for young people in Ennis. Explore projects, meet mentors, and find out how to join CoderDojo Ennis." }] });
</script>

<template>
<div>

<section aria-labelledby="hero-title" class="hero">
<article class="hero-copy">
<p class="eyebrow">Free coding club in Ennis</p>
<h1 id="hero-title">
						Make games.<br/>Learn to <span class="accent">code.</span>
</h1>
<p class="lead">
						Learn to make games, websites, and animations. Get help from mentors
						and meet other kids who like coding. Ages 7 and up. No coding
						experience needed.
					</p>
<p class="actions">
<NuxtLink class="button" to="/join">Join the club <span aria-hidden="true">↗</span></NuxtLink><NuxtLink class="text-link" to="/visit">Plan your visit <span aria-hidden="true">→</span></NuxtLink>
</p>
<ul aria-label="Club at a glance" class="hero-facts">
<li><strong>Free</strong> to attend</li>
<li><strong>Ages 7+</strong> beginners welcome</li>
<li><strong>Ennis</strong> County Clare</li>
</ul>
</article>
<figure class="hero-image">
<img alt="Coders using green laptops together at the club" fetchpriority="high" src="/images/HomeSlideshow/green_machines.jpg"/>
<figcaption>
<span class="photo-label">Club photo</span>Coding together at the club
					</figcaption>
</figure>
</section>
<section aria-labelledby="discover-title" class="section-block">
<header class="section-heading">
<p class="eyebrow">At the club</p>
<h2 id="discover-title">What can you do here?</h2>
<p>Pick something you want to make. We’ll help you get started.</p>
</header>
<section aria-label="Discover the dojo" class="card-grid">
<PublicCard class="">
<p aria-hidden="true" class="card-number">Games</p>
<h3>Make games and websites</h3>
<p>
							Make a game in Scratch, build a website, or try 3D modelling.
							Choose what you want to learn.
						</p>
<NuxtLink class="text-link" to="/explore">See the tools we use <span aria-hidden="true">→</span></NuxtLink>
</PublicCard>
<PublicCard class="">
<p aria-hidden="true" class="card-number">Help</p>
<h3>Get help with your code</h3>
<p>
							Stuck on a bug? Ask a mentor or another coder. You can work on
							your own or with a team.
						</p>
<NuxtLink class="text-link" to="/about">About the club <span aria-hidden="true">→</span></NuxtLink>
</PublicCard>
<PublicCard class="">
<p aria-hidden="true" class="card-number">Projects</p>
<h3>See other kids’ projects</h3>
<p>Play games and see websites made by people at the club.</p>
<NuxtLink class="text-link" to="/showcase">Explore the showcase <span aria-hidden="true">→</span></NuxtLink>
</PublicCard>
</section>
</section>
<PublicCallToAction>
<p class="eyebrow">For parents and volunteers</p>
<h2>Want to help at the club?</h2>
<p>
						Help with coding, setting up, or looking after the group. You don’t
						need to know how to code.
					</p>
<template #action>
<NuxtLink class="button" to="/join#volunteer">Help out <span aria-hidden="true">↗</span></NuxtLink>
</template></PublicCallToAction>
<section aria-label="Find us online" class="link-strip">
<h2>Club news</h2>
<p>
					Follow <NuxtLink to="/news">club news</NuxtLink> for updates, or
					<NuxtLink to="/contact">get in touch</NuxtLink> before your first visit.
				</p>
</section>

</div>
</template>
