<script setup lang="ts">
import PublicCallToAction from "~/components/Public/PublicCallToAction.vue";
import PublicPageIntro from "~/components/Public/PublicPageIntro.vue";
import PublicProjectDirectory from "~/components/Public/PublicProjectDirectory.vue";
definePageMeta({ layout: "public-layout", siteSection: "public" });
useHead({ title: "Coders and projects | CoderDojo Ennis", meta: [{ name: "description", content: "Discover GitHub pages and projects shared by CoderDojo Ennis coders and mentors." }] });
</script>

<template>
<div>

<PublicPageIntro title="Club projects">
<p class="lead">
					See what our coders and mentors have made. These links go to their own
					project pages.
				</p>
</PublicPageIntro>
<PublicProjectDirectory></PublicProjectDirectory>
<PublicCallToAction>
<h2>Add your project page</h2>
<p>
						Add your GitHub username to your club profile to show your project
						page here.
					</p>
<template #action>
<NuxtLink class="button" to="/login">Member sign-in ↗</NuxtLink>
</template></PublicCallToAction>

</div>
</template>
