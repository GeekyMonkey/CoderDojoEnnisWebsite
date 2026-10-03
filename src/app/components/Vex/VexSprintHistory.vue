<script setup lang="ts">
	import type { VexSprintModel } from "#shared/types/models/VexSprintModel";
	import type { VexTaskModel } from "#shared/types/models/VexTaskModel";
	import {
		type VexTaskProgress,
		VexTaskProgressCounts,
		VexTasksBySprintId,
	} from "#shared/utils/VexHelpers";
	import { useVexStore } from "~/stores/useVexStore";

	const props = defineProps<{
		seasonId: string;
		excludeSprintId?: string | null;
	}>();

	type HistoryRow = {
		sprint: VexSprintModel;
		progress: VexTaskProgress;
	};

	const { t } = useI18n();
	const { formatDate, SPRINT_STATUS_COLORS } = useVexFormat();
	const { sprintsForSeason, useSeasonTasks } = useVexStore();

	const seasonIdRef = computed<string>(() => props.seasonId);
	const { Tasks } = useSeasonTasks(seasonIdRef);

	/**
	 * Sprints newest first, with task progress
	 */
	const rows = computed<HistoryRow[]>(() => {
		const bySprint: Record<string, VexTaskModel[]> = VexTasksBySprintId(
			Tasks.value,
		);
		return sprintsForSeason(props.seasonId)
			.filter((s) => s.id !== props.excludeSprintId)
			.reverse()
			.map((sprint) => ({
				sprint,
				progress: VexTaskProgressCounts(bySprint[sprint.id] ?? []),
			}));
	});
</script>

<template>
	<p v-if="rows.length === 0" class="VexHistoryEmpty">
		{{ t("vex.resources.empty") }}
	</p>
	<ul v-else class="VexSprintHistory">
		<li v-for="row in rows" :key="row.sprint.id">
			<NuxtLink :to="`/vex/sprint/${row.sprint.id}`" class="VexHistoryRow">
				<span class="VexHistoryWeek">
					{{ t("vex.sprint.weekNumber", { number: row.sprint.sprintNumber }) }}
				</span>
				<span class="VexHistoryMain">
					<span class="VexHistoryObjective">
						{{ row.sprint.title ||
							row.sprint.objective ||
							t("vex.sprint.noObjective") }}
					</span>
					<span v-if="row.sprint.startDate" class="VexHistoryDate">
						{{ formatDate(row.sprint.startDate) }}
					</span>
				</span>
				<span class="VexHistoryMeta">
					<span v-if="row.progress.total > 0" class="VexHistoryProgress">
						{{ t("vex.sprint.progress", {
								done: row.progress.done,
								total: row.progress.total,
							}) }}
					</span>
					<UBadge
						:color="SPRINT_STATUS_COLORS[row.sprint.status]"
						variant="subtle"
						size="sm"
					>
						{{ t(`vex.sprint.status.${row.sprint.status}`) }}
					</UBadge>
					<UIcon name="i-lucide-chevron-right" />
				</span>
			</NuxtLink>
		</li>
	</ul>
</template>

<style scoped lang="scss">
	.VexSprintHistory {
		display: flex;
		flex-direction: column;
		border: solid 1px var(--ui-border);
		border-radius: var(--border-radius);
		overflow: hidden;

		li + li {
			border-top: solid 1px var(--ui-border);
		}
	}

	.VexHistoryRow {
		display: flex;
		align-items: center;
		gap: calc(var(--spacing) * 3);
		padding: calc(var(--spacing) * 3) calc(var(--spacing) * 4);

		&:hover {
			background: var(--ui-bg-elevated);
		}
	}

	.VexHistoryWeek {
		flex: none;
		width: 4.5rem;
		font-weight: 800;
	}

	.VexHistoryMain {
		flex: 1;
		display: flex;
		flex-direction: column;
		min-width: 0;
	}

	.VexHistoryObjective {
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.VexHistoryDate,
	.VexHistoryProgress,
	.VexHistoryEmpty {
		font-size: 0.85rem;
		color: var(--ui-text-muted);
	}

	.VexHistoryMeta {
		flex: none;
		display: flex;
		align-items: center;
		gap: calc(var(--spacing) * 2);
	}

	@media (max-width: 640px) {
		.VexHistoryProgress {
			display: none;
		}
	}
</style>
