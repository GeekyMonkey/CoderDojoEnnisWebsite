<script setup lang="ts">
	import type { VexSeasonModel } from "#shared/types/models/VexSeasonModel";
	import { useVexStore } from "~/stores/useVexStore";

	const { t } = useI18n();
	const route = useRoute();
	const { IsMentor, isLoading, loadError, seasonBySlug } = useVexStore();

	const isSeasonModalOpen = ref<boolean>(false);

	const season = computed<VexSeasonModel | null>(() =>
		seasonBySlug(String(route.params.slug ?? "")),
	);

	const pageTitle = computed<string>(() =>
		season.value
			? `${season.value.competitionName} ${season.value.seasonLabel}`
			: t("nav.VEX"),
	);

	/**
	 * Open the season edit dialog
	 */
	function openSeasonEdit(): void {
		isSeasonModalOpen.value = true;
	}
</script>

<template>
	<UDashboardPanel id="vex-season">
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
				<p v-else-if="!season" class="VexMuted">
					{{ t("vex.season.notFound") }}
				</p>
				<template v-else>
					<VexSeasonBanner
						:season="season"
						:is-mentor="false"
						:heading="season.seasonLabel"
					/>
					<UButton
						v-if="IsMentor"
						icon="i-lucide-pencil"
						variant="soft"
						color="neutral"
						:label="t('vex.actions.editSeason')"
						class="VexSelfStart"
						@click="openSeasonEdit"
					/>
					<section class="VexSeasonWeeks">
						<h2 class="VexHeading">{{ t("vex.season.weeks") }}</h2>
						<VexSprintHistory :season-id="season.id" />
					</section>
					<VexSeasonEditModal
						v-if="IsMentor"
						v-model:open="isSeasonModalOpen"
						:season="season"
					/>
				</template>
			</div>
		</template>
	</UDashboardPanel>
</template>

<style scoped lang="scss">
	.VexPage {
		display: flex;
		flex-direction: column;
		gap: calc(var(--spacing) * 6);
		padding: calc(var(--spacing) * 4);
		max-width: 1200px;
	}

	.VexSeasonWeeks {
		display: flex;
		flex-direction: column;
		gap: calc(var(--spacing) * 3);
	}

	.VexHeading {
		font-size: 1.3rem;
		font-weight: 800;
	}

	.VexSelfStart {
		align-self: flex-start;
	}

	.VexMuted {
		color: var(--ui-text-muted);
	}
</style>
