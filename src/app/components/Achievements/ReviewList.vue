<script setup lang="ts">
	import type { ProfileMode } from "#shared/types/MemberProfile";
	import ShowcaseEvidenceCards from "./ShowcaseEvidenceCards.vue";
	import { useMemberPresenceStore } from "~/stores/useMemberPresenceStore";
	import { useActionNotifications } from "~/composables/useActionNotifications";
	import type { ColumnDef, Row } from "@tanstack/vue-table";
	import { watch, type ComputedRef, type Ref } from "vue";
	import type {
		AchievementDecision,
		AchievementKind,
		AchievementReview,
	} from "#shared/types/AchievementReview";
	import { useMemberBadgesStore } from "~/stores/useMemberBadgesStore";
	import { useBeltReviewsStore } from "~/stores/useMemberBeltsStore";
	import { useMembersStore } from "~/stores/useMembersStore";
	import { useTeamsStore } from "~/stores/useTeamsStore";
	import MemberCurrentBelt from "~/components/Members/MemberCurrentBelt.vue";
	import MemberPresenceLegend from "~/components/Members/MemberPresenceLegend.vue";
	import MemberPresencePhoto from "~/components/Members/MemberPresencePhoto.vue";
	import ApplicationFeedback from "./ApplicationFeedback.vue";
	import BeltColor from "~/components/Belts/BeltColor.vue";

	const props = withDefaults(defineProps<{ kind: AchievementKind; memberId?: string; mode?: ProfileMode }>(), { mode: "edit" });
	type Action = AchievementDecision["action"];
	type ReviewGroup = { key: string; rows: AchievementReview[] };
	const { t } = useI18n();
	const { presentById } = useMemberPresenceStore();
	const { publish } = useActionNotifications();
	const reviews: ReturnType<typeof useMemberBadgesStore> =
		props.kind === "badge"
			? useMemberBadgesStore(
					props.memberId === undefined
						? undefined
						: (): string => props.memberId ?? "",
				)
			: useBeltReviewsStore(
					props.memberId === undefined
						? undefined
						: (): string => props.memberId ?? "",
				);
	const { data, isLoading, isError } = reviews;
	const { MembersById } = useMembersStore();
	const { TeamsById } = useTeamsStore();
	const expanded: Ref<Record<string, boolean>> = ref({});
	const notes: Ref<Record<string, string>> = ref({});
	const busy: Ref<string | null> = ref(null);

	const confirmation: Ref<{
		review: AchievementReview;
		action: Action;
	} | null> = ref(null);
	const confirmationOpen: Ref<boolean> = ref(false);
	const rows: ComputedRef<AchievementReview[]> = computed(
		(): AchievementReview[] =>
			[...(data.value ?? [])].sort(
				(a: AchievementReview, b: AchievementReview): number =>
					(a.categoryName ?? "").localeCompare(b.categoryName ?? "") ||
					a.sortOrder - b.sortOrder ||
					a.label.localeCompare(b.label) ||
					a.memberName.localeCompare(b.memberName),
			),
	);
	const goalIds: ComputedRef<Set<string>> = computed((): Set<string> => {
		const earned: Set<string> = new Set(
			rows.value
				.filter((review: AchievementReview): boolean => review.awarded !== null)
				.map((review: AchievementReview): string => review.definitionId),
		);
		return new Set(
			rows.value
				.filter(
					(review: AchievementReview): boolean =>
						review.goalDate !== null && !earned.has(review.definitionId),
				)
				.map((review: AchievementReview): string => review.definitionId),
		);
	});
	const groups: ComputedRef<ReviewGroup[]> = computed((): ReviewGroup[] => {
		if (!props.memberId) return [{ key: "pending", rows: rows.value }];
		const pending: AchievementReview[] = rows.value.filter(
			(review: AchievementReview): boolean =>
				review.applicationDate !== null &&
				review.awarded === null &&
				review.rejectedDate === null,
		);
		const awarded: AchievementReview[] = rows.value.filter(
			(review: AchievementReview): boolean => review.awarded !== null,
		);
		const unavailable: Set<string> = new Set(
			[...pending, ...awarded].map(
				(review: AchievementReview): string => review.definitionId,
			),
		);
		const available: Map<string, AchievementReview> = new Map();
		for (const review of rows.value) {
			if (unavailable.has(review.definitionId) || review.definitionDeleted)
				continue;
			const previous: AchievementReview | null =
				available.get(review.definitionId) ?? null;
			if (
				!previous ||
				(review.rejectedDate ?? 0) > (previous.rejectedDate ?? 0)
			)
				available.set(review.definitionId, review);
		}
		const archived: AchievementReview[] = rows.value.filter(
			(review: AchievementReview): boolean =>
				review.definitionDeleted &&
				review.awarded === null &&
				!pending.includes(review),
		);
		return [
			{ key: "pending", rows: pending },
			{ key: "awarded", rows: awarded },
			{ key: "available", rows: [...available.values()] },
			...(archived.length ? [{ key: "archived", rows: archived }] : []),
		];
	});
	const rejectionsByRow: ComputedRef<Record<string, AchievementReview[]>> =
		computed((): Record<string, AchievementReview[]> => {
			const result: Record<string, AchievementReview[]> = {};
			for (const review of rows.value)
				result[review.id] = rows.value.filter(
					(rejection: AchievementReview): boolean =>
						rejection.definitionId === review.definitionId &&
						rejection.rejectedDate !== null &&
						rejection.id !== review.id,
				);
			return result;
		});
	const heading: ComputedRef<string> = computed((): string =>
		t(
			`achievementReviews.${props.memberId ? `${props.kind}History` : `${props.kind}Pending`}`,
		),
	);
	const pendingEmptyMessage: ComputedRef<string> = computed((): string =>
		t(`achievementReviews.${props.kind}PendingEmpty`),
	);
	const columns: ComputedRef<ColumnDef<AchievementReview>[]> = computed(
		(): ColumnDef<AchievementReview>[] => [
			...(props.memberId
				? []
				: [{ accessorKey: "memberName", header: t("coders.label") }]),
			{ accessorKey: "label", header: t(`achievementReviews.${props.kind}`) },
			...(props.memberId ? [] : [{ id: "team", header: t("teams.label") }]),
			...(props.kind === "belt" && !props.memberId
				? []
				: [{ id: "status", header: t("achievementReviews.status") }]),
		],
	);
	const tableMeta: { class: { tr: string } } = { class: { tr: "ReviewRow" } };

	/** Toggle application details using the stable achievement ID. */
	function selectRow(_event: Event, row: Row<AchievementReview>): void {
		expanded.value = expanded.value[row.id] ? {} : { [row.id]: true };
	}

	/** Return stable table row IDs. */
	function rowId(review: AchievementReview): string {
		return review.id;
	}

	/** Format achievement dates for the selected locale. */
	function displayDate(value: number | null): string {
		return value ? new Date(value).toLocaleDateString() : "—";
	}

	/** Save a decision through the store and display translated feedback. */
	async function submit(
		review: AchievementReview,
		action: Action,
	): Promise<void> {
		if (props.mode !== "edit" || busy.value) return;
		busy.value = review.id;
		try {
			await reviews.decide(
				review,
				action,
				notes.value[review.id]?.trim() ?? "",
			);
			notes.value[review.id] = "";
			publish({
				name: "achievement.review.success",
				severity: "success",
				message: t("achievementReviews.saved"),
			});
			expanded.value = {};
		} catch {
			publish({
				name: "achievement.review.error",
				severity: "error",
				message: t("achievementReviews.saveError"),
			});
		} finally {
			busy.value = null;
		}
	}

	/** Require confirmation before rejecting or undoing an application. */
	function requestConfirmation(
		review: AchievementReview,
		action: Action,
	): void {
		if (props.mode !== "edit") return;
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
	watch((): ProfileMode => props.mode, (): void => {
        confirmationOpen.value = false;
        confirmation.value = null;
        notes.value = {};
    });
</script>

<template>
	<section class="ReviewList">
		<h2>{{ heading }}</h2>

		<div v-if="isError" role="alert">
			<p>{{ t("achievementReviews.loadError") }}</p>
			<UButton @click="reviews.refetch()">{{
				t("achievementReviews.retry")
			}}</UButton>
		</div>
		<p v-else-if="!isLoading && !rows.length">
			{{ memberId ? t("achievementReviews.empty") : pendingEmptyMessage }}
		</p>
		<MemberPresenceLegend v-if="!memberId && rows.length" />
		<section v-for="group in groups" :key="group.key" class="HistorySection">
			<h3 v-if="memberId">
				{{ t(`achievementReviews.${group.key}`) }} ({{ group.rows.length }})
			</h3>
			<p v-if="memberId && !isLoading && !group.rows.length">
				{{
					group.key === "pending"
						? pendingEmptyMessage
						: t("achievementReviews.empty")
				}}
			</p>
			<UTable
				v-if="!isError && (isLoading || group.rows.length)"
				v-model:expanded="expanded"
				:data="group.rows"
				:columns="columns"
				:loading="isLoading"
				:getRowId="rowId"
				:meta="tableMeta"
				@select="selectRow"
			>
				<template #loading><span /></template>
				<template #memberName-cell="{ row }">
					<div class="MemberCell">
						<MemberPresencePhoto
							v-if="MembersById[row.original.memberId]"
							:member="MembersById[row.original.memberId]!"
							:present="
								presentById === null
									? null
									: presentById[row.original.memberId] === true
							"
							size="sm"
						/>
						<NuxtLink
							:to="`/member/member/${row.original.memberId}`"
							@click.stop
							>{{ row.original.memberName }}</NuxtLink
						>
					</div>
					<MemberCurrentBelt
						size="sm"
						v-if="
							(kind !== 'belt' || memberId) &&
							MembersById[row.original.memberId]
						"
						:member="MembersById[row.original.memberId]!"
					/>
				</template>
				<template #label-cell="{ row }">
					<BeltColor
						v-if="kind === 'belt'"
						:belt="row.original.belt"
						size="sm"
					/>
					<span v-else
						>{{
							row.original.categoryName ??
							t("definitionMaintenance.unavailableCategory")
						}}
						— {{ row.original.label }}</span
					><span
						v-if="goalIds.has(row.original.definitionId)"
						class="GoalMarker"
						>★ {{ t("achievementReviews.goal") }}</span
					>
				</template>
				<template #team-cell="{ row }">
					<TeamLogo
						:for="MembersById[row.original.memberId] ?? 'UNASSIGNED'"
						size="sm"
					/>
					{{
						TeamsById[MembersById[row.original.memberId]?.teamId ?? ""]
							?.teamName ?? "—"
					}}
				</template>
				<template #status-cell="{ row }">
					{{
						t(
							`achievementReviews.${row.original.awarded ? "awarded" : row.original.rejectedDate ? "rejected" : row.original.applicationDate ? "pending" : goalIds.has(row.original.definitionId) ? "goal" : "available"}`,
						)
					}}
				</template>
				<template #expanded="{ row }">
					<div class="ReviewDetails">
						<p class="Description">{{ row.original.description }}</p>
						<div
							v-for="rejection in rejectionsByRow[row.original.id] ?? []"
							:key="rejection.id"
						>
							<ApplicationFeedback :review="rejection" /><UButton
								v-if="mode === 'edit' && rejection.applicationDate"
								color="neutral"
								:disabled="Boolean(busy)"
								@click="requestConfirmation(rejection, 'undo')"
								>{{ t("achievementReviews.undo") }}</UButton
							>
						</div>
						<p
							v-if="
								row.original.canReview === false &&
								!row.original.awarded &&
								!row.original.rejectedDate &&
								row.original.applicationDate
							"
							role="status"
						>
							{{ t("achievementReviews.ownChild") }}
						</p>
						<p>
							{{ t("achievementReviews.applied") }}:
							{{ displayDate(row.original.applicationDate) }}
						</p>
						<blockquote>{{ row.original.applicationNotes || "—" }}</blockquote>
						<ShowcaseEvidenceCards :items="row.original.showcaseItems ?? []" />
						<template v-if="row.original.awarded || row.original.rejectedDate">
							<p>
								{{ t("achievementReviews.decided") }}:
								{{
									displayDate(row.original.awarded ?? row.original.rejectedDate)
								}}
							</p>
							<p>
								{{ t("achievementReviews.mentor") }}:
								{{
									MembersById[
										row.original.awardedByAdultId ??
											row.original.rejectedByAdultId ??
											""
									]?.nameFirst ?? "—"
								}}
								{{
									MembersById[
										row.original.awardedByAdultId ??
											row.original.rejectedByAdultId ??
											""
									]?.nameLast ?? ""
								}}
							</p>
							<blockquote>
								{{
									row.original.awardedNotes ?? row.original.rejectedNotes ?? "—"
								}}
							</blockquote>
							<UButton
								v-if="mode === 'edit' && row.original.applicationDate"
								color="neutral"
								:disabled="Boolean(busy)"
								@click="requestConfirmation(row.original, 'undo')"
								>{{ t("achievementReviews.undo") }}</UButton
							>
						</template>
						<template v-else-if="mode === 'edit' && row.original.applicationDate">
							<label :for="`decision-notes-${row.original.id}`">{{
								t("achievementReviews.notes")
							}}</label>
							<UTextarea
								:id="`decision-notes-${row.original.id}`"
								v-model="notes[row.original.id]"
								:maxlength="4000"
								:disabled="Boolean(busy) || row.original.canReview === false"
								class="DecisionNotes"
							/>
							<div class="ReviewActions">
								<UButton
									:loading="busy === row.original.id"
									:disabled="
										Boolean(busy) ||
										row.original.canReview === false ||
										!notes[row.original.id]?.trim()
									"
									@click="submit(row.original, 'approve')"
									>{{ t("achievementReviews.approve") }}</UButton
								>
								<UButton
									color="error"
									:disabled="
										Boolean(busy) ||
										row.original.canReview === false ||
										!notes[row.original.id]?.trim()
									"
									@click="requestConfirmation(row.original, 'reject')"
									>{{ t("achievementReviews.reject") }}</UButton
								>
							</div>
						</template>
					</div>
				</template>
			</UTable>
		</section>
		<UModal v-if="mode === 'edit'"
			v-model:open="confirmationOpen"
			:title="t('achievementReviews.confirmTitle')"
			:description="t('achievementReviews.confirmDescription')"
		>
			<template #body
				><p>
					{{ confirmation?.review.memberName }} —
					{{ confirmation?.review.label }}
				</p>
				<p>
					{{
						t(
							`achievementReviews.${confirmation?.action === "undo" ? "undo" : "reject"}`,
						)
					}}
				</p>
				<blockquote>
					{{ confirmation ? notes[confirmation.review.id] : "" }}
				</blockquote></template
			>
			<template #footer
				><UButton color="neutral" @click="confirmationOpen = false">{{
					t("achievementReviews.cancel")
				}}</UButton
				><UButton color="error" @click="confirmDecision">{{
					t("achievementReviews.confirm")
				}}</UButton></template
			>
		</UModal>
	</section>
</template>

<style scoped lang="scss">
	.ReviewList {
		display: grid;
		gap: calc(var(--spacing) * 3);
		width: 100%;
		min-width: 0;
	}
	.HistorySection {
		display: grid;
		gap: calc(var(--spacing) * 3);
		min-width: 0;
	}
	h3 {
		font-weight: 600;
	}
	.GoalMarker {
		display: block;
		color: var(--ui-warning);
	}
	.Description {
		white-space: pre-wrap;
		overflow-wrap: anywhere;
	}
	h2 {
		font-size: var(--text-xl);
		font-weight: 600;
	}
	.MemberCell,
	.ReviewActions {
		display: flex;
		align-items: center;
		gap: calc(var(--spacing) * 3);
	}
	.ReviewDetails {
		display: grid;
		gap: calc(var(--spacing) * 2);
		padding: calc(var(--spacing) * 4);
		background: var(--ui-bg-elevated);
	}
	blockquote {
		white-space: pre-wrap;
		overflow-wrap: anywhere;
	}
	.DecisionNotes {
		width: 100%;
	}
	:deep(.ReviewRow) {
		cursor: pointer;
	}
	.MemberCell {
		padding: calc(var(--spacing) * 2);
	}
	.MemberCell a {
		white-space: normal;
		overflow-wrap: anywhere;
	}
	@media (max-width: 640px) {
		:deep(thead) {
			display: none;
		}
		:deep(table),
		:deep(tbody) {
			display: block;
			width: 100%;
		}
		:deep(.ReviewRow) {
			display: grid;
			grid-template-columns: minmax(0, 1fr) auto;
			gap: calc(var(--spacing) * 2);
			padding: calc(var(--spacing) * 3);
			border-bottom: 1px solid var(--ui-border);
		}
		:deep(.ReviewRow td) {
			padding: 0;
			white-space: normal;
			min-width: 0;
		}
		:deep(.ReviewRow td:nth-child(3)),
		:deep(.ReviewRow td:nth-child(4)) {
			font-size: var(--text-xs);
			color: var(--ui-text-muted);
		}
		:deep(.ReviewRow td:nth-child(4)) {
			text-align: right;
		}
		.MemberCell {
			gap: calc(var(--spacing) * 3);
		}
		:deep(tbody > tr:has(td[colspan])) {
			display: block;
		}
		:deep(td[colspan]) {
			display: block;
			width: 100%;
		}
		.ReviewActions {
			flex-wrap: wrap;
		}
	}
</style>
