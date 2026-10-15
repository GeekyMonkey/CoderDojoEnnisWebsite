<script setup lang="ts">
	import ShowcaseEvidenceCards from "./ShowcaseEvidenceCards.vue";
	import PendingShowcaseLinks from "./PendingShowcaseLinks.vue";
	import { computed, type ComputedRef } from "vue";
	import type { AchievementReview } from "#shared/types/AchievementReview";
	const props = defineProps<{
		review: AchievementReview;
		editableShowcase?: boolean;
	}>();
	const { t, locale } = useI18n();
	const dates: ComputedRef<Record<string, string>> = computed(
		(): Record<string, string> =>
			Object.fromEntries(
				(
					["applicationDate", "awarded", "rejectedDate", "goalDate"] as const
				).map(
					(
						key: "applicationDate" | "awarded" | "rejectedDate" | "goalDate",
					): [string, string] => [
						key,
						props.review[key] === null
							? "—"
							: new Date(props.review[key]!).toLocaleDateString(locale.value),
					],
				),
			),
	);
</script>
<template>
	<div class="Evidence">
		<template v-if="review.applicationDate !== null"
			><p>{{ t("achievementReviews.applied") }}: {{ dates.applicationDate }}</p>
			<blockquote>{{ review.applicationNotes || "—" }}</blockquote></template
		><template v-if="review.awarded !== null"
			><p>{{ t("achievementReviews.awarded") }}: {{ dates.awarded }}</p>
			<blockquote>{{ review.awardedNotes || "—" }}</blockquote>
			<p>
				{{ t("achievementReviews.mentor") }}: {{ review.awardedByName || "—" }}
			</p></template
		><template v-else-if="review.rejectedDate !== null"
			><p>{{ t("achievementReviews.rejected") }}: {{ dates.rejectedDate }}</p>
			<blockquote>{{ review.rejectedNotes || "—" }}</blockquote>
			<p>
				{{ t("achievementReviews.mentor") }}: {{ review.rejectedByName || "—" }}
			</p>
			<p>{{ t("achievementReviews.reapply") }}</p></template
		>
		<p v-else-if="review.applicationDate !== null">
			{{ t("achievementReviews.pending") }} —
			{{ t("achievementReviews.askMentor") }}
		</p>
		<p v-if="review.goalDate !== null && review.awarded === null">
			★ {{ t("achievementReviews.goal") }}: {{ dates.goalDate }}
		</p>
		<PendingShowcaseLinks
			v-if="
				editableShowcase &&
				review.applicationDate !== null &&
				review.awarded === null &&
				review.rejectedDate === null
			"
			:review="review"
		/><ShowcaseEvidenceCards v-else :items="review.showcaseItems ?? []" />
	</div>
</template>
<style scoped lang="scss">
	.Evidence {
		display: grid;
		gap: calc(var(--spacing) * 2);
	}
	blockquote {
		white-space: pre-wrap;
		overflow-wrap: anywhere;
	}
</style>
