<script setup lang="ts">
	defineProps<{
		title?: string;
		description?: string;
	}>();
</script>

<template>
	<div class="PlaceholderPage">
		<UCard>
			<template #header>
				<div class="flex items-start justify-between gap-4">
					<div>
						<h2 v-if="title" class="text-lg font-semibold text-highlighted">
							{{ title }}
						</h2>
						<p v-if="description" class="text-sm text-muted mt-1">
							{{ description }}
						</p>
					</div>
					<UBadge color="neutral" variant="subtle">Coming soon</UBadge>
				</div>
			</template>

			<div class="text-sm text-muted">This feature isn’t implemented yet.</div>
		</UCard>
	</div>
</template>

<style scoped lang="css">
	.PlaceholderPage {
		padding: calc(var(--spacing) * 4);
		max-width: 900px;
	}
</style>
