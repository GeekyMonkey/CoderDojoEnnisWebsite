<script setup lang="ts">
	const { pageTitle } = useMemberLayoutContext();
</script>

<template>
	<UDashboardPanel id="mentor-members">
		<template #header>
			<DashboardHeading :page-title="pageTitle" />
		</template>
		<template #body>
			<PlaceholderPage description="Member management is coming soon." />
		</template>
	</UDashboardPanel>
</template>
