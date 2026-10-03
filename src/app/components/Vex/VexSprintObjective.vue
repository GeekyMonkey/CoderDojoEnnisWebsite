<script setup lang="ts">
	import type { VexSprintModel } from "#shared/types/models/VexSprintModel";

	const props = defineProps<{
		sprint: VexSprintModel;
		isMentor: boolean;
		compact?: boolean;
	}>();

	const emit = defineEmits<{
		edit: [];
	}>();

	const { t } = useI18n();
	const { formatDate, SPRINT_STATUS_COLORS } = useVexFormat();

	const hasDates = computed<boolean>(
		() => !!props.sprint.startDate || !!props.sprint.reviewDate,
	);

	const startLabel = computed<string>(
		() =>
			`${t("vex.sprint.dates.start")}: ${formatDate(props.sprint.startDate)}`,
	);

	const reviewLabel = computed<string>(
		() =>
			`${t("vex.sprint.dates.review")}: ${formatDate(props.sprint.reviewDate)}`,
	);
</script>

<template>
	<section class="VexSprintObjective" :data-compact="compact">
		<div class="VexObjectiveTop">
			<div class="VexObjectiveMeta">
				<span class="VexWeekNumber">
					{{ t("vex.sprint.weekNumber", { number: sprint.sprintNumber }) }}
				</span>
				<span v-if="sprint.title" class="VexWeekTitle">{{ sprint.title }}</span>
				<UBadge
					:color="SPRINT_STATUS_COLORS[sprint.status]"
					variant="subtle"
					size="sm"
				>
					{{ t(`vex.sprint.status.${sprint.status}`) }}
				</UBadge>
			</div>
			<UButton
				v-if="isMentor"
				icon="i-lucide-pencil"
				size="sm"
				variant="soft"
				:label="t('vex.actions.editObjective')"
				@click="emit('edit')"
			/>
		</div>

		<div v-if="hasDates" class="VexObjectiveDates">
			<span v-if="sprint.startDate" class="VexDate">
				<UIcon name="i-lucide-calendar" />
				{{ startLabel }}
			</span>
			<span v-if="sprint.reviewDate" class="VexDate">
				<UIcon name="i-lucide-presentation" />
				{{ reviewLabel }}
			</span>
		</div>

		<h2 class="VexObjectiveHeading">{{ t("vex.sprint.objectiveHeading") }}</h2>
		<p v-if="sprint.objective" class="VexObjectiveText">
			{{ sprint.objective }}
		</p>
		<p v-else class="VexObjectiveEmpty">{{ t("vex.sprint.noObjective") }}</p>

		<div v-if="sprint.mentorNotes && !compact" class="VexMentorNotes">
			<h3 class="VexMentorNotesHeading">{{ t("vex.sprint.mentorNotes") }}</h3>
			<p class="VexMultiline">{{ sprint.mentorNotes }}</p>
		</div>
	</section>
</template>

<style scoped lang="scss">
	.VexSprintObjective {
		display: flex;
		flex-direction: column;
		gap: calc(var(--spacing) * 2);
		padding: calc(var(--spacing) * 5);
		border-radius: var(--border-radius);
		border: solid 2px var(--ui-primary);
		background: color-mix(in srgb, var(--ui-primary) 6%, var(--ui-bg));
	}

	.VexObjectiveTop {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: calc(var(--spacing) * 2);
		flex-wrap: wrap;
	}

	.VexObjectiveMeta {
		display: flex;
		align-items: center;
		gap: calc(var(--spacing) * 2);
		flex-wrap: wrap;
	}

	.VexWeekNumber {
		font-size: 1.1rem;
		font-weight: 800;
	}

	.VexWeekTitle {
		font-weight: 600;
		color: var(--ui-text-muted);
	}

	.VexObjectiveDates {
		display: flex;
		gap: calc(var(--spacing) * 4);
		flex-wrap: wrap;
		color: var(--ui-text-muted);
		font-size: 0.9rem;
	}

	.VexDate {
		display: inline-flex;
		align-items: center;
		gap: calc(var(--spacing) * 1);
	}

	.VexObjectiveHeading {
		margin-top: calc(var(--spacing) * 2);
		font-size: 0.85rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		color: var(--ui-primary);
	}

	.VexObjectiveText {
		font-size: 1.5rem;
		font-weight: 700;
		line-height: 1.3;
		white-space: pre-line;
	}

	.VexObjectiveEmpty {
		font-size: 1.1rem;
		font-style: italic;
		color: var(--ui-text-muted);
	}

	.VexMentorNotes {
		margin-top: calc(var(--spacing) * 2);
		padding-top: calc(var(--spacing) * 3);
		border-top: solid 1px var(--ui-border);
	}

	.VexMentorNotesHeading {
		font-weight: 700;
		margin-bottom: calc(var(--spacing) * 1);
	}

	.VexMultiline {
		white-space: pre-line;
	}

	.VexSprintObjective[data-compact="true"] {
		.VexObjectiveText {
			font-size: 1.25rem;
		}
	}
</style>
