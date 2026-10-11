<script setup lang="ts">
	import { useActionNotifications } from "~/composables/useActionNotifications";
	import type { ColumnDef, Row } from "@tanstack/vue-table";
	import type { ComputedRef, Ref } from "vue";
	import type { AchievementDecision, AchievementKind, AchievementReview } from "#shared/types/AchievementReview";
	import { useMemberBadgesStore } from "~/stores/useMemberBadgesStore";
	import { useBeltReviewsStore } from "~/stores/useMemberBeltsStore";
	import { useMembersStore } from "~/stores/useMembersStore";
	import { useTeamsStore } from "~/stores/useTeamsStore";
	import BeltColor from "~/components/Belts/BeltColor.vue";

	const props = defineProps<{ kind: AchievementKind; memberId?: string }>();
	type Action = AchievementDecision["action"];
	const { t } = useI18n();
	const { publish } = useActionNotifications();
	const reviews: ReturnType<typeof useMemberBadgesStore> = props.kind === "badge"
		? useMemberBadgesStore(props.memberId === undefined ? undefined : (): string => props.memberId ?? "")
		: useBeltReviewsStore(props.memberId === undefined ? undefined : (): string => props.memberId ?? "");
	const { data, isLoading, isError } = reviews;
	const { MembersById } = useMembersStore();
	const { TeamsById } = useTeamsStore();
	const expanded: Ref<Record<string, boolean>> = ref({});
	const notes: Ref<Record<string, string>> = ref({});
	const busy: Ref<string | null> = ref(null);

	const confirmation: Ref<{ review: AchievementReview; action: Action } | null> = ref(null);
	const confirmationOpen: Ref<boolean> = ref(false);
	const rows: ComputedRef<AchievementReview[]> = computed((): AchievementReview[] => [...(data.value ?? [])].sort((a: AchievementReview, b: AchievementReview): number => a.sortOrder - b.sortOrder || a.label.localeCompare(b.label) || a.memberName.localeCompare(b.memberName)));
	const heading: ComputedRef<string> = computed((): string => t(`achievementReviews.${props.memberId ? `${props.kind}History` : `${props.kind}Pending`}`));
	const columns: ComputedRef<ColumnDef<AchievementReview>[]> = computed((): ColumnDef<AchievementReview>[] => [
		{ accessorKey: "memberName", header: t("coders.label") },
		{ accessorKey: "label", header: t(`achievementReviews.${props.kind}`) },
		{ id: "team", header: t("teams.label") },
		{ id: "status", header: t("achievementReviews.status") },
	]);
	const tableMeta: { class: { tr: string } } = { class: { tr: "ReviewRow" } };

	/** Toggle application details using the stable achievement ID. */
	function selectRow(_event: Event, row: Row<AchievementReview>): void {
		expanded.value = expanded.value[row.id] ? {} : { [row.id]: true };
	}

	/** Return stable table row IDs. */
	function rowId(review: AchievementReview): string { return review.id; }

	/** Format achievement dates for the selected locale. */
	function displayDate(value: number | null): string { return value ? new Date(value).toLocaleDateString() : "—"; }

	/** Save a decision through the store and display translated feedback. */
	async function submit(review: AchievementReview, action: Action): Promise<void> {
		if (busy.value) return;
		busy.value = review.id;
		try {
			await reviews.decide(review, action, notes.value[review.id]?.trim() ?? "");
			notes.value[review.id] = "";
			publish({ name: "achievement.review.success", severity: "success", message: t("achievementReviews.saved") });
			expanded.value = {};
		} catch {
			publish({ name: "achievement.review.error", severity: "error", message: t("achievementReviews.saveError") });
		} finally { busy.value = null; }
	}

	/** Require confirmation before rejecting or undoing an application. */
	function requestConfirmation(review: AchievementReview, action: Action): void {
		confirmation.value = { review, action };
		confirmationOpen.value = true;
	}

	/** Submit only the decision currently presented in the confirmation dialog. */
	async function confirmDecision(): Promise<void> {
		const selected: typeof confirmation.value = confirmation.value;
		confirmationOpen.value = false;
		confirmation.value = null;
		if (selected) await submit(selected.review, selected.action);
	}
</script>

<template>
	<section class="ReviewList">
		<h2>{{ heading }}</h2>

		<div v-if="isError" role="alert">
			<p>{{ t("achievementReviews.loadError") }}</p>
			<UButton @click="reviews.refetch()">{{ t("achievementReviews.retry") }}</UButton>
		</div>
		<p v-else-if="!isLoading && !rows.length">{{ t("achievementReviews.empty") }}</p>
		<UTable v-else v-model:expanded="expanded" :data="rows" :columns="columns" :loading="isLoading" :getRowId="rowId" :meta="tableMeta" @select="selectRow">
			<template #memberName-cell="{ row }">
				<div class="MemberCell">
					<MemberAvatar v-if="MembersById[row.original.memberId]" :member="MembersById[row.original.memberId]!" size="sm" />
					<NuxtLink :to="`/mentor/coder/${row.original.memberId}`" @click.stop>{{ row.original.memberName }}</NuxtLink>
				</div>
			</template>
			<template #label-cell="{ row }">
				<BeltColor v-if="kind === 'belt'" :belt="row.original.belt" size="sm" />
				<span v-else>{{ row.original.label }}</span>
			</template>
			<template #team-cell="{ row }">
				<TeamLogo :for="MembersById[row.original.memberId] ?? 'UNASSIGNED'" size="sm" />
				{{ TeamsById[MembersById[row.original.memberId]?.teamId ?? ""]?.teamName ?? "—" }}
			</template>
			<template #status-cell="{ row }">
				{{ t(`achievementReviews.${row.original.awarded ? 'awarded' : row.original.rejectedDate ? 'rejected' : row.original.applicationDate ? 'pending' : 'goal'}`) }}
			</template>
			<template #expanded="{ row }">
				<div class="ReviewDetails">
					<p>{{ row.original.description }}</p>
					<p>{{ t("achievementReviews.applied") }}: {{ displayDate(row.original.applicationDate) }}</p>
					<blockquote>{{ row.original.applicationNotes || "—" }}</blockquote>
					<template v-if="row.original.awarded || row.original.rejectedDate">
						<p>{{ t("achievementReviews.decided") }}: {{ displayDate(row.original.awarded ?? row.original.rejectedDate) }}</p>
						<p>{{ t("achievementReviews.mentor") }}: {{ MembersById[row.original.awardedByAdultId ?? row.original.rejectedByAdultId ?? ""]?.nameFirst ?? "—" }} {{ MembersById[row.original.awardedByAdultId ?? row.original.rejectedByAdultId ?? ""]?.nameLast ?? "" }}</p>
						<blockquote>{{ row.original.awardedNotes ?? row.original.rejectedNotes ?? "—" }}</blockquote>
						<UButton v-if="row.original.applicationDate" color="neutral" :disabled="Boolean(busy)" @click="requestConfirmation(row.original, 'undo')">{{ t("achievementReviews.undo") }}</UButton>
					</template>
					<template v-else-if="row.original.applicationDate">
						<label :for="`decision-notes-${row.original.id}`">{{ t("achievementReviews.notes") }}</label>
						<UTextarea :id="`decision-notes-${row.original.id}`" v-model="notes[row.original.id]" :maxlength="4000" :disabled="Boolean(busy)" class="DecisionNotes" />
						<div class="ReviewActions">
							<UButton :loading="busy === row.original.id" :disabled="Boolean(busy) || !notes[row.original.id]?.trim()" @click="submit(row.original, 'approve')">{{ t("achievementReviews.approve") }}</UButton>
							<UButton color="error" :disabled="Boolean(busy) || !notes[row.original.id]?.trim()" @click="requestConfirmation(row.original, 'reject')">{{ t("achievementReviews.reject") }}</UButton>
						</div>
					</template>
				</div>
			</template>
		</UTable>
		<UModal v-model:open="confirmationOpen" :title="t('achievementReviews.confirmTitle')" :description="t('achievementReviews.confirmDescription')">
			<template #body><p>{{ confirmation?.review.memberName }} — {{ confirmation?.review.label }}</p><p>{{ t(`achievementReviews.${confirmation?.action === 'undo' ? 'undo' : 'reject'}`) }}</p><blockquote>{{ confirmation ? notes[confirmation.review.id] : "" }}</blockquote></template>
			<template #footer><UButton color="neutral" @click="confirmationOpen = false">{{ t("achievementReviews.cancel") }}</UButton><UButton color="error" @click="confirmDecision">{{ t("achievementReviews.confirm") }}</UButton></template>
		</UModal>
	</section>
</template>

<style scoped lang="scss">
	.ReviewList { display: grid; gap: calc(var(--spacing) * 3); max-width: 1100px; }
	h2 { font-size: var(--text-xl); font-weight: 600; }
	.MemberCell, .ReviewActions { display: flex; align-items: center; gap: calc(var(--spacing) * 3); }
	.ReviewDetails { display: grid; gap: calc(var(--spacing) * 2); padding: calc(var(--spacing) * 4); background: var(--ui-bg-elevated); }
	blockquote { white-space: pre-wrap; overflow-wrap: anywhere; }
	.DecisionNotes { width: 100%; }
	:deep(.ReviewRow) { cursor: pointer; }
</style>
