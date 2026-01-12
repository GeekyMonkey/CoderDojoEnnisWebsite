<script setup lang="ts">
	definePageMeta({
		layout: "member-layout",
	});

	const { pageTitle } = useMemberLayoutContext();
</script>

<template>
	<UDashboardPanel id="coder-belts">
		<template #header>
			<DashboardHeading :page-title="pageTitle" />
		</template>
		<template #body>
			<div class="p-4">
				<p>Placeholder: coder belts coming soon.</p>
			</div>
		</template>
	</UDashboardPanel>
</template>

<style scoped lang="css"></style>
