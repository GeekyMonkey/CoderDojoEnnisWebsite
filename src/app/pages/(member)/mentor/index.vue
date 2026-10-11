<script setup lang="ts">
	import AchievementsReviewList from "~/components/Achievements/ReviewList.vue";
	const log = useLogger("MentorPage");
	const { pageTitle } = useMemberLayoutContext();

	onMounted(() => {
		// Trigger the teams data load
		log.info("Mounted");
	});
</script>

<template>
	<UDashboardPanel id="mentor-home">
		<template #header>
			<DashboardHeading :page-title="pageTitle" />
		</template>
		<template #body>
			<div class="MentorReviews">
				<ApplicationsPending />
				<AchievementsReviewList kind="badge" />
			</div>
		</template>
	</UDashboardPanel>
</template>

<style scoped lang="scss">
	.MentorReviews { display: grid; gap: calc(var(--spacing) * 8); padding: calc(var(--spacing) * 4); }
</style>
