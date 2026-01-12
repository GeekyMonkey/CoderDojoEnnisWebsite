<script setup lang="ts">
	const log = useLogger("MentorPage");

	definePageMeta({
		layout: "member-layout",
	});

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
			<div class="p-4">
				<TeamsList />
			</div>
		</template>
	</UDashboardPanel>
</template>

<style lang="css" scoped></style>
