<script setup lang="ts">
	import type { MemberModel } from "#shared/types/models/MemberModel";
	import type { VexSprintModel } from "#shared/types/models/VexSprintModel";
	import {
		VEX_TASK_STATUSES,
		type VexTaskModel,
		type VexTaskStatus,
	} from "#shared/types/models/VexTaskModel";
	import {
		type VexTaskProgress,
		VexTaskProgressCounts,
	} from "#shared/utils/VexHelpers";
	import { useMembersStore } from "~/stores/useMembersStore";
	import { useVexStore } from "~/stores/useVexStore";

	const props = defineProps<{
		sprint: VexSprintModel;
	}>();

	type TaskGroup = {
		status: VexTaskStatus;
		tasks: VexTaskModel[];
	};

	const { t } = useI18n();
	const toast = useToast();
	const { memberName } = useVexFormat();
	const { MembersById } = useMembersStore();
	const { CurrentMemberId, IsMentor, saveTask, useSprintTasks } = useVexStore();

	const sprintId = computed<string>(() => props.sprint.id);
	const { Tasks, isLoading: isTasksLoading } = useSprintTasks(sprintId);

	const isTaskModalOpen = ref<boolean>(false);
	const isSprintModalOpen = ref<boolean>(false);
	const editingTask = ref<VexTaskModel | null>(null);
	const busyTaskId = ref<string | null>(null);

	const progress = computed<VexTaskProgress>(() =>
		VexTaskProgressCounts(Tasks.value),
	);

	const taskGroups = computed<TaskGroup[]>(() =>
		VEX_TASK_STATUSES.map((status) => ({
			status,
			tasks: Tasks.value.filter((task) => task.status === status),
		})),
	);

	/**
	 * Tasks with something written down, for the Saturday review
	 */
	const findings = computed<VexTaskModel[]>(() =>
		Tasks.value.filter((task) => !!task.notes || !!task.linkUrl),
	);

	/**
	 * Names of a task's owners
	 */
	function ownerNames(task: VexTaskModel): string {
		const names: string[] = task.ownerMemberIds
			.map((id) => MembersById.value[id])
			.filter((m): m is MemberModel => !!m)
			.map((m) => memberName(m));
		return names.length > 0 ? names.join(", ") : t("vex.task.nobody");
	}

	/**
	 * Open the task dialog (new or existing)
	 */
	function openTask(task: VexTaskModel | null): void {
		editingTask.value = task;
		isTaskModalOpen.value = true;
	}

	/**
	 * Save a quick change to a task (status or owners) without opening the dialog
	 */
	async function quickSave(
		task: VexTaskModel,
		changes: Partial<Pick<VexTaskModel, "status" | "ownerMemberIds">>,
	): Promise<void> {
		busyTaskId.value = task.id;
		try {
			await saveTask({
				id: task.id,
				sprintId: task.sprintId,
				title: task.title,
				notes: task.notes,
				linkUrl: task.linkUrl,
				status: changes.status ?? task.status,
				ownerMemberIds: changes.ownerMemberIds ?? task.ownerMemberIds,
			});
		} catch (error) {
			toast.add({
				title: t("vex.common.saveError", { error: ErrorToString(error) }),
				color: "error",
			});
		} finally {
			busyTaskId.value = null;
		}
	}

	/**
	 * Open the mentor's edit dialog for this week
	 */
	function openSprintEdit(): void {
		isSprintModalOpen.value = true;
	}

	/**
	 * Add or remove the current member as an owner
	 */
	function toggleJoin(task: VexTaskModel): void {
		const me: string | null = CurrentMemberId.value;
		if (!me) {
			return;
		}
		const ownerMemberIds: string[] = task.ownerMemberIds.includes(me)
			? task.ownerMemberIds.filter((id) => id !== me)
			: [...task.ownerMemberIds, me];
		quickSave(task, { ownerMemberIds });
	}
</script>

<template>
	<div class="VexSprintWorkspace">
		<VexSprintObjective
			:sprint="sprint"
			:is-mentor="IsMentor"
			@edit="openSprintEdit"
		/>

		<section class="VexWorkspaceSection">
			<div class="VexSectionHeader">
				<div>
					<h2 class="VexSectionHeading">{{ t("vex.sprint.tasks.heading") }}</h2>
					<p class="VexSectionHint">{{ t("vex.sprint.tasks.hint") }}</p>
				</div>
				<div class="VexSectionHeaderActions">
					<UBadge
						v-if="progress.total > 0"
						color="success"
						variant="subtle"
						size="lg"
					>
						{{ t("vex.sprint.progress", {
								done: progress.done,
								total: progress.total,
							}) }}
					</UBadge>
					<UButton
						icon="i-lucide-plus"
						:label="t('vex.actions.addTask')"
						@click="openTask(null)"
					/>
				</div>
			</div>

			<p v-if="isTasksLoading" class="VexMuted">
				{{ t("vex.common.loading") }}
			</p>
			<p v-else-if="Tasks.length === 0" class="VexEmpty">
				{{ t("vex.sprint.tasks.empty") }}
			</p>
			<div v-else class="VexTaskGroups">
				<div
					v-for="group in taskGroups"
					:key="group.status"
					class="VexTaskGroup"
				>
					<h3 class="VexTaskGroupHeading" :data-status="group.status">
						{{ t(`vex.task.status.${group.status}`) }}
						<span class="VexTaskGroupCount">{{ group.tasks.length }}</span>
					</h3>
					<VexTaskCard
						v-for="task in group.tasks"
						:key="task.id"
						:task="task"
						:members-by-id="MembersById"
						:current-member-id="CurrentMemberId"
						:busy="busyTaskId === task.id"
						@edit="openTask(task)"
						@set-status="(status) => quickSave(task, { status })"
						@toggle-join="toggleJoin(task)"
					/>
				</div>
			</div>
		</section>

		<section class="VexWorkspaceSection">
			<h2 class="VexSectionHeading">{{ t("vex.sprint.findings.heading") }}</h2>
			<p class="VexSectionHint">{{ t("vex.sprint.findings.hint") }}</p>
			<p v-if="findings.length === 0" class="VexEmpty">
				{{ t("vex.sprint.findings.empty") }}
			</p>
			<ul v-else class="VexFindings">
				<li
					v-for="task in findings"
					:key="task.id"
					class="VexFinding"
					:data-status="task.status"
				>
					<div class="VexFindingHeader">
						<strong>{{ task.title }}</strong>
						<span class="VexMuted">· {{ ownerNames(task) }}</span>
						<UBadge
							v-if="task.status !== 'done'"
							color="warning"
							variant="subtle"
							size="sm"
						>
							{{ t("vex.sprint.carryOver") }}
						</UBadge>
					</div>
					<p v-if="task.notes" class="VexFindingNotes">{{ task.notes }}</p>
					<a
						v-if="task.linkUrl"
						:href="task.linkUrl"
						target="_blank"
						rel="noopener noreferrer"
						class="VexFindingLink"
					>
						<UIcon name="i-lucide-link" />
						{{ task.linkUrl }}
					</a>
				</li>
			</ul>
		</section>

		<VexTaskEditModal
			v-model:open="isTaskModalOpen"
			:task="editingTask"
			:sprint-id="sprint.id"
		/>
		<VexSprintEditModal
			v-if="IsMentor"
			v-model:open="isSprintModalOpen"
			:sprint="sprint"
			:season-id="sprint.seasonId"
		/>
	</div>
</template>

<style scoped lang="scss">
	.VexSprintWorkspace {
		display: flex;
		flex-direction: column;
		gap: calc(var(--spacing) * 8);
	}

	.VexWorkspaceSection {
		display: flex;
		flex-direction: column;
		gap: calc(var(--spacing) * 3);
	}

	.VexSectionHeader {
		display: flex;
		justify-content: space-between;
		align-items: flex-end;
		gap: calc(var(--spacing) * 3);
		flex-wrap: wrap;
	}

	.VexSectionHeaderActions {
		display: flex;
		align-items: center;
		gap: calc(var(--spacing) * 3);
	}

	.VexSectionHeading {
		font-size: 1.3rem;
		font-weight: 800;
	}

	.VexSectionHint,
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

	.VexTaskGroups {
		display: grid;
		grid-template-columns: repeat(3, minmax(0, 1fr));
		gap: calc(var(--spacing) * 4);
		align-items: start;
	}

	.VexTaskGroup {
		display: flex;
		flex-direction: column;
		gap: calc(var(--spacing) * 3);
		padding: calc(var(--spacing) * 3);
		border-radius: var(--border-radius);
		background: var(--ui-bg-elevated);
	}

	.VexTaskGroupHeading {
		display: flex;
		align-items: center;
		justify-content: space-between;
		font-weight: 700;
	}

	.VexTaskGroupCount {
		font-size: 0.85rem;
		color: var(--ui-text-muted);
	}

	.VexFindings {
		display: flex;
		flex-direction: column;
		gap: calc(var(--spacing) * 3);
	}

	.VexFinding {
		padding: calc(var(--spacing) * 3) calc(var(--spacing) * 4);
		border-left: solid 4px var(--ui-success);
		background: var(--ui-bg-elevated);
		border-radius: 0 var(--border-radius) var(--border-radius) 0;

		&[data-status="in_progress"],
		&[data-status="todo"] {
			border-left-color: var(--ui-warning);
		}
	}

	.VexFindingHeader {
		display: flex;
		align-items: center;
		flex-wrap: wrap;
		gap: calc(var(--spacing) * 2);
	}

	.VexFindingNotes {
		margin-top: calc(var(--spacing) * 2);
		white-space: pre-line;
	}

	.VexFindingLink {
		display: inline-flex;
		align-items: center;
		gap: calc(var(--spacing) * 1);
		margin-top: calc(var(--spacing) * 2);
		color: var(--ui-primary);
		word-break: break-all;
	}

	@media (max-width: 1000px) {
		.VexTaskGroups {
			grid-template-columns: 1fr;
		}
	}
</style>
