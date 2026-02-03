<script setup lang="ts">
	const { pageTitle } = useMemberLayoutContext();
</script>

<template>
	<UDashboardPanel id="mentor-maintenance-purge-members">
		<template #header>
			<DashboardHeading :page-title="pageTitle" />
		</template>
		<template #body>
			<PlaceholderPage description="Maintenance tools are coming soon." />
		</template>
	</UDashboardPanel>
</template>
