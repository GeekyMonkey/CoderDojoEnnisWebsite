<script setup lang="ts">
	type UiOverride = Record<string, unknown>;

	defineProps<{
		pageTitle: string;
		breadcrumbLabel?: string;
		breadcrumbTo?: string;
		ui?: UiOverride;
	}>();
</script>

<template>
	<UDashboardNavbar :title="pageTitle" :ui="ui">
		<template v-if="breadcrumbLabel && breadcrumbTo" #title>
			<span class="DashboardBreadcrumb">
				<NuxtLink :to="breadcrumbTo">{{ breadcrumbLabel }}</NuxtLink>
				<span aria-hidden="true">-</span>
				<span>{{ pageTitle }}</span>
			</span>
		</template>
		<template #toggle>
			<DashboardToggle />
		</template>

		<template v-if="$slots.leading" #leading>
			<slot name="leading" />
		</template>

		<template v-if="$slots.right" #right>
			<slot name="right" />
		</template>
	</UDashboardNavbar>
</template>

<style scoped lang="scss">
	.DashboardBreadcrumb { display: flex; align-items: center; flex-wrap: wrap; gap: calc(var(--spacing) * 2); font-size: inherit; font-weight: 600; }
	.DashboardBreadcrumb a:hover { text-decoration: underline; }
</style>
