<script setup lang="ts">
	definePageMeta({
		layout: "member-layout",
	});

	const { pageTitle } = useMemberLayoutContext();
</script>

<template>
	<UDashboardPanel id="mentor-maintenance-teams">
		<template #header>
			<DashboardHeading :page-title="pageTitle" />
		</template>
		<template #body>
			<PlaceholderPage description="Maintenance tools are coming soon." />
		</template>
	</UDashboardPanel>
</template>
