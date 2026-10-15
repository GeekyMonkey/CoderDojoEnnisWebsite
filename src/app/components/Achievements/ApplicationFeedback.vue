<script setup lang="ts">
	import ShowcaseEvidenceCards from "./ShowcaseEvidenceCards.vue";
	import type { AchievementReview } from "#shared/types/AchievementReview";
	import { useMembersStore } from "~/stores/useMembersStore";
	const props = defineProps<{ review: AchievementReview }>();
	const { t } = useI18n();
	const { MembersById } = useMembersStore();
	/** Format an application or decision date in the selected locale. */
	function date(value: number | null): string {
		return value === null ? "—" : new Date(value).toLocaleDateString();
	}
</script>
<template>
	<div class="ApplicationFeedback">
		<template v-if="review.rejectedDate !== null"
			><p>
				{{ t("achievementReviews.rejected") }}: {{ date(review.rejectedDate) }}
			</p>
			<blockquote>{{ review.rejectedNotes || "—" }}</blockquote>
			<p>
				{{ t("achievementReviews.mentor") }}:
				{{ MembersById[review.rejectedByAdultId ?? ""]?.nameFirst ?? "—" }}
				{{ MembersById[review.rejectedByAdultId ?? ""]?.nameLast ?? "" }}
			</p></template
		>
		<template
			v-else-if="review.applicationDate !== null && review.awarded === null"
			><p>
				{{ t("achievementReviews.pending") }} —
				{{ t("achievementReviews.applied") }}:
				{{ date(review.applicationDate) }}
			</p>
			<blockquote v-if="review.applicationNotes">
				{{ review.applicationNotes }}
			</blockquote></template
		>
		<ShowcaseEvidenceCards :items="review.showcaseItems ?? []" />
	</div>
</template>
<style scoped lang="scss">
	.ApplicationFeedback {
		display: grid;
		gap: calc(var(--spacing) * 2);
	}
	blockquote {
		white-space: pre-wrap;
		overflow-wrap: anywhere;
	}
</style>
