<script setup lang="ts">
	const { pageTitle } = useMemberLayoutContext();
</script>

<template>
	<UDashboardPanel id="coder-badges-available">
		<template #header>
			<DashboardHeading :page-title="pageTitle" />
		</template>
		<template #body>
			<div class="p-4">
				<p>Placeholder: available badges list coming soon.</p>
			</div>
		</template>
	</UDashboardPanel>
</template>

<style scoped lang="css"></style>
