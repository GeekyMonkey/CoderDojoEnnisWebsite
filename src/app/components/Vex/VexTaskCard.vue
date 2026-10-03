<script setup lang="ts">
	import type { MemberModel } from "#shared/types/models/MemberModel";
	import {
		VEX_TASK_STATUSES,
		type VexTaskModel,
		type VexTaskStatus,
	} from "#shared/types/models/VexTaskModel";

	const props = defineProps<{
		task: VexTaskModel;
		membersById: Record<string, MemberModel>;
		currentMemberId: string | null;
		busy?: boolean;
	}>();

	const emit = defineEmits<{
		edit: [];
		setStatus: [status: VexTaskStatus];
		toggleJoin: [];
	}>();

	const { t } = useI18n();
	const { memberName, TASK_STATUS_COLORS, TASK_STATUS_ICONS } = useVexFormat();

	const owners = computed<MemberModel[]>(() =>
		props.task.ownerMemberIds
			.map((id) => props.membersById[id])
			.filter((m): m is MemberModel => !!m),
	);

	const isOwner = computed<boolean>(
		() =>
			!!props.currentMemberId &&
			props.task.ownerMemberIds.includes(props.currentMemberId),
	);

	/**
	 * Emit a status change if the status is different
	 */
	function selectStatus(status: VexTaskStatus): void {
		if (props.task.status !== status) {
			emit("setStatus", status);
		}
	}
</script>

<template>
	<article class="VexTaskCard" :data-status="task.status">
		<div class="VexTaskHeader">
			<UIcon :name="TASK_STATUS_ICONS[task.status]" class="VexTaskStatusIcon" />
			<h4 class="VexTaskTitle">{{ task.title }}</h4>
			<UButton
				icon="i-lucide-pencil"
				size="xs"
				variant="ghost"
				color="neutral"
				:aria-label="t('vex.actions.edit')"
				@click="emit('edit')"
			/>
		</div>

		<div class="VexTaskOwners">
			<template v-if="owners.length > 0">
				<span v-for="owner in owners" :key="owner.id" class="VexTaskOwner">
					<MemberAvatar :member="owner" size="sm" />
					<span>{{ memberName(owner) }}</span>
				</span>
			</template>
			<span v-else class="VexTaskNobody">{{ t("vex.task.nobody") }}</span>
			<UButton
				v-if="currentMemberId"
				size="xs"
				:variant="isOwner ? 'ghost' : 'soft'"
				:color="isOwner ? 'neutral' : 'primary'"
				:icon="isOwner ? 'i-lucide-user-minus' : 'i-lucide-hand'"
				:label="isOwner ? t('vex.actions.leaveTask') : t('vex.actions.joinTask')"
				:disabled="busy"
				@click="emit('toggleJoin')"
			/>
		</div>

		<p v-if="task.notes" class="VexTaskNotes">{{ task.notes }}</p>

		<a
			v-if="task.linkUrl"
			:href="task.linkUrl"
			target="_blank"
			rel="noopener noreferrer"
			class="VexTaskLink"
		>
			<UIcon name="i-lucide-link" />
			<span>{{ task.linkUrl }}</span>
		</a>

		<div class="VexTaskStatusButtons" role="group">
			<UButton
				v-for="status in VEX_TASK_STATUSES"
				:key="status"
				size="xs"
				:color="TASK_STATUS_COLORS[status]"
				:variant="task.status === status ? 'solid' : 'outline'"
				:label="t(`vex.task.status.${status}`)"
				:aria-pressed="task.status === status"
				:disabled="busy"
				@click="selectStatus(status)"
			/>
		</div>
	</article>
</template>

<style scoped lang="scss">
	.VexTaskCard {
		display: flex;
		flex-direction: column;
		gap: calc(var(--spacing) * 2);
		padding: calc(var(--spacing) * 3);
		border-radius: var(--border-radius);
		border: solid 1px var(--ui-border);
		border-left-width: 4px;
		background: var(--ui-bg);

		&[data-status="todo"] {
			border-left-color: var(--ui-border-accented);
		}

		&[data-status="in_progress"] {
			border-left-color: var(--ui-warning);
		}

		&[data-status="done"] {
			border-left-color: var(--ui-success);
		}
	}

	.VexTaskHeader {
		display: flex;
		align-items: flex-start;
		gap: calc(var(--spacing) * 2);
	}

	.VexTaskStatusIcon {
		flex: none;
		margin-top: 0.2rem;
		width: 1.1rem;
		height: 1.1rem;
		color: var(--ui-text-muted);

		.VexTaskCard[data-status="in_progress"] & {
			color: var(--ui-warning);
		}

		.VexTaskCard[data-status="done"] & {
			color: var(--ui-success);
		}
	}

	.VexTaskTitle {
		flex: 1;
		font-weight: 700;
		line-height: 1.3;
	}

	.VexTaskOwners {
		display: flex;
		align-items: center;
		flex-wrap: wrap;
		gap: calc(var(--spacing) * 2);
	}

	.VexTaskOwner {
		display: inline-flex;
		align-items: center;
		gap: calc(var(--spacing) * 1.5);
		font-size: 0.9rem;
		font-weight: 600;
	}

	.VexTaskNobody {
		font-size: 0.9rem;
		font-style: italic;
		color: var(--ui-text-muted);
	}

	.VexTaskNotes {
		font-size: 0.9rem;
		white-space: pre-line;
		color: var(--ui-text-toned);
		display: -webkit-box;
		-webkit-line-clamp: 4;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}

	.VexTaskLink {
		display: inline-flex;
		align-items: center;
		gap: calc(var(--spacing) * 1);
		font-size: 0.85rem;
		color: var(--ui-primary);
		overflow: hidden;

		span {
			overflow: hidden;
			text-overflow: ellipsis;
			white-space: nowrap;
		}
	}

	.VexTaskStatusButtons {
		display: flex;
		flex-wrap: wrap;
		gap: calc(var(--spacing) * 1);
	}
</style>
