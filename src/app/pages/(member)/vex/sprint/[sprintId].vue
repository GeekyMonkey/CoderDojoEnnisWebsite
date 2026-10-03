<script setup lang="ts">
	import type { VexSeasonModel } from "#shared/types/models/VexSeasonModel";
	import type { VexSprintModel } from "#shared/types/models/VexSprintModel";
	import { useVexStore } from "~/stores/useVexStore";

	const { t } = useI18n();
	const route = useRoute();
	const { SeasonsById, SprintsById, isLoading, loadError } = useVexStore();

	const sprint = computed<VexSprintModel | null>(() => {
		const id: string = String(route.params.sprintId ?? "");
		return SprintsById.value[id] ?? null;
	});

	const season = computed<VexSeasonModel | null>(() =>
		sprint.value ? (SeasonsById.value[sprint.value.seasonId] ?? null) : null,
	);

	const pageTitle = computed<string>(() => {
		if (!sprint.value) {
			return t("nav.VEX");
		}
		const week: string = t("vex.sprint.weekNumber", {
			number: sprint.value.sprintNumber,
		});
		return season.value
			? `${week} · ${season.value.competitionName} ${season.value.seasonLabel}`
			: week;
	});
</script>

<template>
	<UDashboardPanel id="vex-sprint">
		<template #header>
			<DashboardHeading :page-title="pageTitle">
				<template #right>
					<VexSectionNav />
				</template>
			</DashboardHeading>
		</template>
		<template #body>
			<div class="VexPage">
				<UAlert
					v-if="loadError"
					color="error"
					variant="subtle"
					:title="t('vex.common.loadError', { error: loadError })"
				/>
				<p v-else-if="isLoading" class="VexMuted">
					{{ t("vex.common.loading") }}
				</p>
				<p v-else-if="!sprint" class="VexMuted">
					{{ t("vex.sprint.notFound") }}
				</p>
				<VexSprintWorkspace v-else :sprint="sprint" />
			</div>
		</template>
	</UDashboardPanel>
</template>

<style scoped lang="scss">
	.VexPage {
		padding: calc(var(--spacing) * 4);
		max-width: 1400px;
	}

	.VexMuted {
		color: var(--ui-text-muted);
	}
</style>
