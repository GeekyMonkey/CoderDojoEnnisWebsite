<script setup lang="ts">
import PublicArchiveNotice from "~/components/Public/PublicArchiveNotice.vue";
import PublicCallToAction from "~/components/Public/PublicCallToAction.vue";
import PublicPageIntro from "~/components/Public/PublicPageIntro.vue";
definePageMeta({ layout: "public-layout", siteSection: "public" });
useHead({ title: "Club news | CoderDojo Ennis", meta: [{ name: "description", content: "Follow CoderDojo Ennis news and session updates, and browse the archive of mentor meetup notes." }] });
</script>

<template>
<div>

<PublicPageIntro title="Club news">
<p class="lead">
					Check our Facebook page for news and changes to session times.
				</p>
</PublicPageIntro>
<PublicCallToAction>
<h2>Latest updates</h2>
<p>Check for updates before you come to a session.</p>
<template #action>
<a class="button" href="https://www.facebook.com/CoderDojoEnnis">Visit Facebook ↗</a>
</template></PublicCallToAction>
<section class="section-block prose">
<h2>Old mentor meeting notes</h2>
<p>
					Notes from mentor meetings in 2014–2019. These are old notes, not
					current session times.
				</p>
<PublicArchiveNotice year="Past mentor meetings"><p>These notes are historical. Follow the club on Facebook for current updates.</p></PublicArchiveNotice><details class="archive">
<summary>Read old meeting notes</summary>
<ul class="resource-list">
<li>
<a href="https://docs.google.com/document/d/1aWTLsx2_WDVH8-ARIVfzPAC2wTeSxrCVFlcxq74f32E">2019 September ↗</a>
</li>
<li>
<a href="https://drive.google.com/open?id=1nqRrXEbI8k8PA0hv0mqQrLbYnhY2HViy24A3jLDYt1U">2018 September ↗</a>
</li>
<li>
<a href="https://drive.google.com/open?id=1MlzvRD_If4E4Aw6LzSRYkgRECri78TJGsTQ1eRDq3wA">2018 April ↗</a>
</li>
<li>
<a href="https://drive.google.com/open?id=1Yx1Jwk6BkSLetdylTdurE8JM03A0z_OysHgxYwIRVNo">2017 September ↗</a>
</li>
<li>
<a href="https://docs.google.com/document/d/1GSSM97fILQxz1hVdWPd_vwPgx51hMIXBPyBKDJ32_Ow">2016 September ↗</a>
</li>
<li>
<a href="https://docs.google.com/document/d/1qQ46M3sBOWL0OQ2xKdhASy8jnjYIYEHjxDqY28fZ_aM">2016 February ↗</a>
</li>
<li>
<a href="https://docs.google.com/document/d/1XBl-WcDmMasgv4KGveMWmjAuAk4r9nQxi0UFLa5es54">2015 September ↗</a>
</li>
<li>
<a href="https://docs.google.com/document/d/1MQn6GBkRdGQzNviD2CYoCQzNYZNkKZt-kYmTnfbWuzk">2015 April ↗</a>
</li>
<li>
<a href="https://docs.google.com/document/d/1o8lHzHKokkkMbwlc1D8q7wP_KgiB_q3Y1SLKajVLLoo">2014 End of Year ↗</a>
</li>
<li>
<a href="https://docs.google.com/document/d/1KA_neyNRAnJqyOHbExQwyrjkgs3rXlzDzrBuTYCFj5E">2014 October ↗</a>
</li>
<li>
<a href="https://docs.google.com/document/d/1OP3Pc6QZfVjhnTOSHWayEZiv5MRUt6PnKCANqZgV6LU">2014 September Mentor Meetup ↗</a>
</li>
<li>
<a href="https://docs.google.com/document/d/1hw2J1d3hy2jS_MRQsJixndUm84dVicx2GrbwzV4FOvM">2014 July Mentor Meetup ↗</a>
</li>
</ul>
</details>
</section>

</div>
</template>
