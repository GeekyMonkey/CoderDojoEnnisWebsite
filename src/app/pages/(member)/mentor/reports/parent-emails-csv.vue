<script setup lang="ts">
	definePageMeta({
		layout: "member-layout",
	});

	const { pageTitle } = useMemberLayoutContext();
</script>

<template>
	<UDashboardPanel id="mentor-report-parent-emails-csv">
		<template #header>
			<DashboardHeading :page-title="pageTitle" />
		</template>
		<template #body>
			<PlaceholderPage description="Reporting features are coming soon." />
		</template>
	</UDashboardPanel>
</template>
