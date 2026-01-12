<script setup lang="ts">
	definePageMeta({
		layout: "member-layout",
	});

	const { pageTitle } = useMemberLayoutContext();
</script>

<template>
	<UDashboardPanel id="coder-profile">
		<template #header>
			<DashboardHeading :page-title="pageTitle" />
		</template>
		<template #body>
			<PlaceholderPage description="Profile editing is coming soon." />
		</template>
	</UDashboardPanel>
</template>
