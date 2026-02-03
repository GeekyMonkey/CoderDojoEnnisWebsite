<script setup lang="ts">
	const { pageTitle } = useMemberLayoutContext();
</script>

<template>
	<UDashboardPanel id="parent-home">
		<template #header>
			<DashboardHeading :page-title="pageTitle" />
		</template>
		<template #body>
			<div class="p-4">
				<p>Placeholder: parent portal coming soon.</p>
			</div>
		</template>
	</UDashboardPanel>
</template>

<style lang="css" scoped></style>
