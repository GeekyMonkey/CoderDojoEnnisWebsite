<script setup lang="ts">
	definePageMeta({
		layout: "member-layout",
	});

	const { pageTitle } = useMemberLayoutContext();
</script>

<template>
	<UDashboardPanel id="coder-home">
		<template #header>
			<DashboardHeading :page-title="pageTitle" />
		</template>
		<template #body>
			<div class="p-4">
				<p>Placeholder: coder dashboard coming soon.</p>
			</div>
		</template>
	</UDashboardPanel>
</template>

<style lang="css" scoped></style>
