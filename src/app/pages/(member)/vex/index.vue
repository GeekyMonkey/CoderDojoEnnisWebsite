<script setup lang="ts">
	import type { MemberModel } from "#shared/types/models/MemberModel";
	import {
		VEX_RESOURCE_CATEGORIES,
		type VexResourceCategory,
	} from "#shared/types/models/VexResourceModel";
	import type { VexSeasonModel } from "#shared/types/models/VexSeasonModel";
	import type { VexSprintModel } from "#shared/types/models/VexSprintModel";
	import {
		type VexTaskProgress,
		VexTaskProgressCounts,
	} from "#shared/utils/VexHelpers";
	import { useMembersStore } from "~/stores/useMembersStore";
	import { useVexStore } from "~/stores/useVexStore";

	const { t } = useI18n();
	const { memberName, TASK_STATUS_COLORS } = useVexFormat();
	const { MembersById } = useMembersStore();
	const {
		CurrentSeason,
		CurrentSprint,
		IsMentor,
		PreviousSeasons,
		isLoading,
		loadError,
		sprintsForSeason,
		useSprintTasks,
	} = useVexStore();

	const isSeasonModalOpen = ref<boolean>(false);
	const editingSeason = ref<VexSeasonModel | null>(null);
	const isSprintModalOpen = ref<boolean>(false);

	const currentSprintId = computed<string | null>(
		() => CurrentSprint.value?.id ?? null,
	);
	const { Tasks: currentTasks } = useSprintTasks(currentSprintId);

	const progress = computed<VexTaskProgress>(() =>
		VexTaskProgressCounts(currentTasks.value),
	);

	const hasPreviousWeeks = computed<boolean>(
		() =>
			sprintsForSeason(CurrentSeason.value?.id).filter(
				(s: VexSprintModel) => s.id !== currentSprintId.value,
			).length > 0,
	);

	const resourceCategories = computed<VexResourceCategory[]>(() => [
		...VEX_RESOURCE_CATEGORIES,
	]);

	/**
	 * Owner names for a task
	 */
	function ownerNames(ownerIds: string[]): string {
		const names: string[] = ownerIds
			.map((id) => MembersById.value[id])
			.filter((m): m is MemberModel => !!m)
			.map((m) => memberName(m));
		return names.length > 0 ? names.join(", ") : t("vex.task.nobody");
	}

	/**
	 * Open the season dialog for editing the current season or creating a new one
	 */
	function openSeason(season: VexSeasonModel | null): void {
		editingSeason.value = season;
		isSeasonModalOpen.value = true;
	}

	/**
	 * Open the dialog for starting the next week
	 */
	function openNewSprint(): void {
		isSprintModalOpen.value = true;
	}
</script>

<template>
	<UDashboardPanel id="vex-home">
		<template #header>
			<DashboardHeading :page-title="t('vex.home.title')">
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

				<template v-else-if="!CurrentSeason">
					<VexIntro />
					<p class="VexEmpty">{{ t("vex.common.noSeason") }}</p>
					<UButton
						v-if="IsMentor"
						icon="i-lucide-plus"
						:label="t('vex.actions.newSeason')"
						class="VexSelfStart"
						@click="openSeason(null)"
					/>
				</template>

				<template v-else>
					<VexSeasonBanner
						:season="CurrentSeason"
						:is-mentor="IsMentor"
						@edit="openSeason(CurrentSeason)"
						@create="openSeason(null)"
					/>

					<section class="VexHomeSection">
						<h2 class="VexHomeHeading">{{ t("vex.home.thisWeek") }}</h2>
						<template v-if="CurrentSprint">
							<VexSprintObjective
								:sprint="CurrentSprint"
								:is-mentor="false"
								compact
							/>
							<div class="VexThisWeekTasks">
								<div class="VexThisWeekTasksHeader">
									<span v-if="progress.total > 0" class="VexMuted">
										{{ t("vex.sprint.progress", {
												done: progress.done,
												total: progress.total,
											}) }}
									</span>
									<span v-else class="VexMuted">
										{{ t("vex.sprint.tasks.empty") }}
									</span>
								</div>
								<ul v-if="currentTasks.length > 0" class="VexTaskSummary">
									<li
										v-for="task in currentTasks"
										:key="task.id"
										class="VexTaskSummaryRow"
									>
										<span class="VexTaskSummaryTitle">{{ task.title }}</span>
										<span class="VexTaskSummaryOwners">
											{{ ownerNames(task.ownerMemberIds) }}
										</span>
										<UBadge
											:color="TASK_STATUS_COLORS[task.status]"
											variant="subtle"
											size="sm"
										>
											{{ t(`vex.task.status.${task.status}`) }}
										</UBadge>
									</li>
								</ul>
								<div class="VexThisWeekActions">
									<UButton
										:to="`/vex/sprint/${CurrentSprint.id}`"
										icon="i-lucide-arrow-right"
										trailing
										size="lg"
										:label="t('vex.actions.openWorkspace')"
									/>
									<UButton
										v-if="IsMentor"
										icon="i-lucide-plus"
										variant="soft"
										:label="t('vex.actions.newSprint')"
										@click="openNewSprint"
									/>
								</div>
							</div>
						</template>
						<template v-else>
							<p class="VexEmpty">{{ t("vex.home.noSprint") }}</p>
							<UButton
								v-if="IsMentor"
								icon="i-lucide-plus"
								:label="t('vex.actions.newSprint')"
								class="VexSelfStart"
								@click="openNewSprint"
							/>
						</template>
					</section>

					<VexIntro />

					<section class="VexHomeSection">
						<h2 class="VexHomeHeading">{{ t("vex.home.gettingStarted") }}</h2>
						<p>{{ t("vex.home.gettingStartedText") }}</p>
						<div class="VexVrCallout">
							<UIcon name="i-lucide-monitor-play" class="VexVrIcon" />
							<div>
								<strong>{{ t("vex.resources.vr.heading") }}</strong>
								<p>{{ t("vex.resources.vr.p1") }}</p>
							</div>
						</div>
						<div class="VexCategoryChips">
							<UButton
								v-for="category in resourceCategories"
								:key="category"
								:to="`/vex/resources#${category}`"
								variant="outline"
								color="neutral"
								size="sm"
								:label="t(`vex.resources.categories.${category}.label`)"
							/>
						</div>
						<UButton
							to="/vex/resources"
							variant="link"
							trailing-icon="i-lucide-arrow-right"
							:label="t('vex.actions.seeAllResources')"
							class="VexSelfStart"
						/>
					</section>

					<section v-if="hasPreviousWeeks" class="VexHomeSection">
						<h2 class="VexHomeHeading">{{ t("vex.home.previousWeeks") }}</h2>
						<VexSprintHistory
							:season-id="CurrentSeason.id"
							:exclude-sprint-id="currentSprintId"
						/>
					</section>

					<section v-if="PreviousSeasons.length > 0" class="VexHomeSection">
						<h2 class="VexHomeHeading">{{ t("vex.home.previousSeasons") }}</h2>
						<ul class="VexSeasonLinks">
							<li v-for="season in PreviousSeasons" :key="season.id">
								<NuxtLink
									:to="`/vex/season/${season.slug}`"
									class="VexSeasonLink"
								>
									<strong>{{ season.seasonLabel }}</strong>
									<span>{{ season.competitionName }}</span>
									<UIcon name="i-lucide-chevron-right" />
								</NuxtLink>
							</li>
						</ul>
					</section>

					<VexSprintEditModal
						v-if="IsMentor"
						v-model:open="isSprintModalOpen"
						:sprint="null"
						:season-id="CurrentSeason.id"
					/>
				</template>

				<VexSeasonEditModal
					v-if="IsMentor"
					v-model:open="isSeasonModalOpen"
					:season="editingSeason"
				/>
			</div>
		</template>
	</UDashboardPanel>
</template>

<style scoped lang="scss">
	.VexPage {
		display: flex;
		flex-direction: column;
		gap: calc(var(--spacing) * 8);
		padding: calc(var(--spacing) * 4);
		max-width: 1200px;
	}

	.VexHomeSection {
		display: flex;
		flex-direction: column;
		gap: calc(var(--spacing) * 3);
	}

	.VexHomeHeading {
		font-size: 1.3rem;
		font-weight: 800;
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

	.VexSelfStart {
		align-self: flex-start;
	}

	.VexThisWeekTasks {
		display: flex;
		flex-direction: column;
		gap: calc(var(--spacing) * 3);
	}

	.VexTaskSummary {
		display: flex;
		flex-direction: column;
		border: solid 1px var(--ui-border);
		border-radius: var(--border-radius);

		li + li {
			border-top: solid 1px var(--ui-border);
		}
	}

	.VexTaskSummaryRow {
		display: grid;
		grid-template-columns: 2fr 1.5fr auto;
		align-items: center;
		gap: calc(var(--spacing) * 3);
		padding: calc(var(--spacing) * 2) calc(var(--spacing) * 3);
	}

	.VexTaskSummaryTitle {
		font-weight: 600;
	}

	.VexTaskSummaryOwners {
		font-size: 0.9rem;
		color: var(--ui-text-muted);
	}

	.VexThisWeekActions {
		display: flex;
		gap: calc(var(--spacing) * 3);
		flex-wrap: wrap;
	}

	.VexVrCallout {
		display: flex;
		gap: calc(var(--spacing) * 3);
		padding: calc(var(--spacing) * 4);
		border-radius: var(--border-radius);
		background: var(--ui-bg-elevated);
	}

	.VexVrIcon {
		flex: none;
		width: 2rem;
		height: 2rem;
		color: var(--ui-primary);
	}

	.VexCategoryChips {
		display: flex;
		flex-wrap: wrap;
		gap: calc(var(--spacing) * 2);
	}

	.VexSeasonLinks {
		display: flex;
		flex-direction: column;
		gap: calc(var(--spacing) * 2);
	}

	.VexSeasonLink {
		display: flex;
		align-items: center;
		gap: calc(var(--spacing) * 3);
		padding: calc(var(--spacing) * 3) calc(var(--spacing) * 4);
		border: solid 1px var(--ui-border);
		border-radius: var(--border-radius);

		&:hover {
			background: var(--ui-bg-elevated);
		}
	}

	@media (max-width: 640px) {
		.VexTaskSummaryRow {
			grid-template-columns: 1fr auto;
		}

		.VexTaskSummaryOwners {
			grid-column: 1;
			grid-row: 2;
		}
	}
</style>
