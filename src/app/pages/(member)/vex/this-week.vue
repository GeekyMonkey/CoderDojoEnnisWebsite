<script setup lang="ts">
	import { useVexStore } from "~/stores/useVexStore";

	const { t } = useI18n();
	const { CurrentSeason, CurrentSprint, IsMentor, isLoading, loadError } =
		useVexStore();

	const isSprintModalOpen = ref<boolean>(false);

	/**
	 * Open the dialog for starting the next week
	 */
	function openNewSprint(): void {
		isSprintModalOpen.value = true;
	}
</script>

<template>
	<UDashboardPanel id="vex-this-week">
		<template #header>
			<DashboardHeading :page-title="t('nav.This Week')">
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
				<p v-else-if="!CurrentSeason" class="VexEmpty">
					{{ t("vex.common.noSeason") }}
				</p>
				<VexSprintWorkspace v-else-if="CurrentSprint" :sprint="CurrentSprint" />
				<template v-else>
					<p class="VexEmpty">{{ t("vex.home.noSprint") }}</p>
					<UButton
						v-if="IsMentor"
						icon="i-lucide-plus"
						:label="t('vex.actions.newSprint')"
						@click="openNewSprint"
					/>
					<VexSprintEditModal
						v-if="IsMentor"
						v-model:open="isSprintModalOpen"
						:sprint="null"
						:season-id="CurrentSeason.id"
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
		align-items: stretch;
		gap: calc(var(--spacing) * 4);
		padding: calc(var(--spacing) * 4);
		max-width: 1400px;
	}

	.VexMuted {
		color: var(--ui-text-muted);
	}

	.VexEmpty {
		padding: calc(var(--spacing) * 6);
		text-align: center;
		border: dashed 2px var(--ui-border);
		border-radius: var(--border-radius);
		color: var(--ui-text-muted);
	}
</style>
