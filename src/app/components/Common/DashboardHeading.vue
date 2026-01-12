<script setup lang="ts">
	type UiOverride = Record<string, unknown>;

	defineProps<{
		pageTitle: string;
		ui?: UiOverride;
	}>();
</script>

<template>
	<UDashboardNavbar :title="pageTitle" :ui="ui">
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
