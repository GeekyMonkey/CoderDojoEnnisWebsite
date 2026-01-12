<script setup lang="ts">
	definePageMeta({
		layout: "member-layout",
	});

	const { pageTitle } = useMemberLayoutContext();
</script>

<template>
	<UDashboardPanel id="parent-kids-child-2">
		<template #header>
			<DashboardHeading :page-title="pageTitle" />
		</template>
		<template #body>
			<div class="p-4">
				<p>Placeholder: "My Kids" details coming soon.</p>
			</div>
		</template>
	</UDashboardPanel>
</template>

<style scoped lang="css"></style>
