<script setup lang="ts">
	import type { ColumnDef, Row } from "@tanstack/vue-table";
	import type { BeltModel } from "#shared/types/models/BeltModel";
	import type { MemberBeltModel } from "#shared/types/models/MemberBeltModel";
	import type { MemberModel } from "#shared/types/models/MemberModel";
	import type { TeamModel } from "#shared/types/models/TeamModel";
	import type { ComputedRef, Ref } from "vue";
	import BeltColor from "~/components/Belts/BeltColor.vue";
	import { useMemberBeltsStore } from "~/stores/useMemberBeltsStore";
	import { useTeamsStore } from "~/stores/useTeamsStore";
	import type { PendingBeltApplication } from "~/stores/useMemberBeltsStore";

	type PendingApplicationRow = {
		id: string;
		application: MemberBeltModel;
		member: MemberModel | null;
		memberName: string;
		team: TeamModel | null;
		teamName: string;
		belt: BeltModel | null;
		beltSortOrder: number;
	};

	type TableProps = {
		columns: ColumnDef<PendingApplicationRow>[];
		data: PendingApplicationRow[];
		sticky: boolean;
		loading: boolean;
		expanded: Record<string, boolean>;
		"onUpdate:expanded": (
			value: Record<string, boolean> | boolean | undefined,
		) => void;
		getRowId: (row: PendingApplicationRow) => string;
		onSelect: (event: Event, row: Row<PendingApplicationRow>) => void;
		meta: {
			class: {
				tr: string;
			};
		};
	};

	const { t } = useI18n();
	const { PendingBeltApplications, isPendingApplicationsLoading } =
		useMemberBeltsStore();
	const { TeamsById } = useTeamsStore();

	const expandedRows: Ref<Record<string, boolean>> = ref({});

	/**
	 * Format an application date for display.
	 */
	const formatApplicationDate = (value: number | null): string => {
		return TimestampToDateString(value) ?? "";
	};

	/**
	 * Toggle the expanded state for a table row.
	 */
	const handleRowSelect = (
		_event: Event,
		row: Row<PendingApplicationRow>,
	): void => {
		const rowId = row.id;
		const isExpanded = !!expandedRows.value[rowId];
		expandedRows.value = isExpanded ? {} : { [rowId]: true };
	};

	/**
	 * Map pending applications into table rows.
	 */
	const rows = computed<PendingApplicationRow[]>(() => {
		const teamsById = TeamsById.value;
		return PendingBeltApplications.value.map((entry) => {
			const member = entry.member;
			const team = member?.teamId ? teamsById[member.teamId] || null : null;
			const teamName = team?.teamName || "-";
			const memberName = entry.memberName || "-";
			return {
				id: entry.application.id,
				application: entry.application,
				member,
				memberName,
				team,
				teamName,
				belt: entry.belt,
				beltSortOrder: entry.beltSortOrder,
			};
		});
	});

	/**
	 * Columns for the pending applications table.
	 */
	const columns = computed<ColumnDef<PendingApplicationRow>[]>(() => [
		{
			id: "coder",
			key: "coder",
			accessorKey: "memberName",
			header: t("coders.label"),
		},
		{
			id: "beltColor",
			key: "beltColor",
			accessorFn: (row: PendingApplicationRow) => row.beltSortOrder,
			header: t("belts.label"),
		},
		{
			id: "team",
			key: "team",
			accessorKey: "teamName",
			header: t("teams.label"),
		},
	]);

	/**
	 * Table props for the pending applications list.
	 */
	const tableProps = computed<TableProps>(() => ({
		columns: columns.value,
		data: rows.value,
		sticky: false,
		loading: isPendingApplicationsLoading.value,
		expanded: expandedRows.value,
		"onUpdate:expanded": (value) => {
			if (typeof value === "object" && value !== null) {
				expandedRows.value = value as Record<string, boolean>;
			}
		},
		getRowId: (row) => row.id,
		onSelect: handleRowSelect,
		meta: {
			class: {
				tr: "ApplicationsRow",
			},
		},
	}));

	/**
	 * Determine whether the empty state should be shown.
	 */
	const showEmptyState = computed<boolean>(() => {
		return !isPendingApplicationsLoading.value && rows.value.length === 0;
	});
</script>

<template>
	<div class="ApplicationsPending">
		<div class="Header">
			<h2 class="Heading">{{ t("beltApplications.heading") }}</h2>
		</div>

		<div v-if="showEmptyState" class="EmptyState">
			{{ t("beltApplications.empty") }}
		</div>

		<UTable v-else v-bind="tableProps" class="ApplicationsTable">
			<template #coder-cell="{ row }">
				<div class="CoderCell">
					<MemberAvatar
						v-if="row.original.member"
						:member="row.original.member"
						size="sm"
						link-to="HERE"
					/>
					<span class="CoderName">{{ row.original.memberName }}</span>
				</div>
			</template>

			<template #beltColor-cell="{ row }">
				<BeltColor :belt="row.original.belt || 'noob'" size="lg" />
			</template>

			<template #team-cell="{ row }">
				<div class="TeamCell">
					<TeamLogo
						:for="
							row.original.member?.teamId ? row.original.member : 'UNASSIGNED'
						"
						size="sm"
					/>
					<span class="TeamName">{{ row.original.teamName }}</span>
				</div>
			</template>

			<template #expanded="{ row }">
				<div class="ExpandedPanel">
					<div class="DetailRow">
						<span class="DetailLabel">
							{{ t("beltApplications.applicationDate") }}
						</span>
						<span class="DetailValue">
							{{
								formatApplicationDate(row.original.application.applicationDate)
							}}
						</span>
					</div>
					<div class="DetailRow">
						<span class="DetailLabel">
							{{ t("belts.description") }}
						</span>
						<span class="DetailValue">
							{{ row.original.belt?.description || "-" }}
						</span>
					</div>
					<div class="DetailRow">
						<span class="DetailLabel">
							{{ t("beltApplications.applicationNotes") }}
						</span>
						<blockquote class="DetailValue DetailQuote">
							{{ row.original.application.applicationNotes || "-" }}
						</blockquote>
					</div>
				</div>
			</template>
		</UTable>
	</div>
</template>

<style scoped lang="scss">
	.ApplicationsPending {
		display: flex;
		flex-direction: column;
		gap: calc(var(--spacing) * 2);
		max-width: 900px;
	}

	.Header {
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	.Heading {
		font-size: 1.25rem;
		font-weight: 700;
	}

	.EmptyState {
		color: var(--ui-text);
		opacity: 0.7;
		padding: calc(var(--spacing) * 2) 0;
	}

	.ApplicationsTable {
		.ApplicationsRow {
			cursor: pointer;
		}
	}

	.CoderCell {
		display: flex;
		align-items: center;
		gap: 0.75rem;
	}

	.CoderName {
		font-weight: 600;
	}

	.TableCell {
		.BeltColor {
			margin-right: 2rem;
		}
	}

	.TeamCell {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.TeamName {
		flex-grow: 1;
	}

	.ExpandedPanel {
		display: grid;
		gap: calc(var(--spacing) * 1.5);
		padding: calc(var(--spacing) * 2);
		background: var(--ui-bg-elevated);
		border-radius: calc(var(--radius) * 0.75);
	}

	.DetailRow {
		display: grid;
		grid-template-columns: minmax(100px, 140px) 1fr;
		gap: calc(var(--spacing) * 1.5);
		align-items: center;
		border-bottom: solid 1px color-mix(in srgb, var(--ui-text) 10%, transparent);
		padding-bottom: calc(var(--spacing) * 1.5);

		&:last-child {
			border-bottom: none;
			padding-bottom: 0;
		}
	}

	.DetailLabel {
		font-weight: 600;
		color: var(--ui-text);
		margin-bottom: 0;
	}

	.DetailValue {
		color: var(--ui-text);
		margin-left: 1rem;
	}

	.DetailQuote {
	}

	@media (max-width: 768px) {
		.DetailRow {
			grid-template-columns: 1fr;
		}
	}
</style>
