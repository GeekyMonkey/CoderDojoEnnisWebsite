<script setup lang="ts">
	import { h, resolveComponent, type Component } from "vue";
	import type { MemberModel } from "~~/shared/types/models/MemberModel";
	import { useBeltsStore } from "~/stores/useBeltsStore";
	import { useMemberAttendanceStore } from "~/stores/useMemberAttendanceStore";
	import { useMemberBeltsStore } from "~/stores/useMemberBeltsStore";
	import { useMembersStore } from "~/stores/useMembersStore";
	import { useTeamsStore } from "~/stores/useTeamsStore";

	type TableSortingState = { id: string; desc: boolean }[];
	type ColumnLike = {
		// present for Nuxt UI / TanStack Table header context, but we don't rely on it for UI state
		// because we inject a hidden secondary sort.
	};
	type HeaderCtxLike = { column?: ColumnLike };
	type CellCtxLike = { row?: { original?: AttendanceRow } };

	definePageMeta({
		layout: "member-layout",
	});

	const { pageTitle } = useMemberLayoutContext();
	const { t } = useI18n();
	const route = useRoute();
	const router = useRouter();

	type IncludeMode = "present" | "registered" | "all";

	const includeOptions = computed<{ value: IncludeMode; label: string }[]>(() => {
		return [
			{ value: "present", label: t("attendance.include.presentMembers") },
			{ value: "registered", label: t("attendance.include.registeredMembers") },
			{ value: "all", label: t("attendance.include.allMembers") },
		];
	});

	const {
		SessionDates,
		SessionYears,
		CurrentSessionDate,
		useSessionAttendanceForDate,
		setMemberPresent: setMemberPresentStore,
	} = useMemberAttendanceStore();
	const {
		Members,
		isLoading: isMembersLoading,
		isError: isMembersError,
	} = useMembersStore();
	const { TeamsById } = useTeamsStore();
	const { BeltsById } = useBeltsStore();
	const { MemberBelts } = useMemberBeltsStore();

	const initialDate = (route.query.date as string) || "";
	const initialYear = initialDate.length >= 4 ? initialDate.slice(0, 4) : "";

	const selectedSessionYear = ref<string>(initialYear);
	const selectedSessionDate = ref<string>(initialDate);
	const includeMode = ref<IncludeMode>((route.query.include as IncludeMode) || "registered");
	const searchText = ref<string>((route.query.search as string) || "");

	const initTab = (route.query.tab as string) || "coders";
	const selectedTab = ref<string>(
		["coders", "mentors"].includes(initTab) ? initTab : "coders",
	);


	// State syncing with URL query params
	// Sync In (URL -> State)
	watch(
		() => route.query,
		(q) => {
			// Date & Year
			const d = (q.date as string) || "";
			if (d !== selectedSessionDate.value) {
				selectedSessionDate.value = d;
				if (!d) {
					// Reset year to empty so the default-year logic picks up the current session year
					selectedSessionYear.value = "";
				} else if (d.length >= 4) {
					// Ensure year matches the URL date
					const y = d.slice(0, 4);
					if (y !== selectedSessionYear.value) {
						selectedSessionYear.value = y;
					}
				}
			}

			// Include Mode
			const inc = q.include as IncludeMode;
			if (inc && inc !== includeMode.value) {
				includeMode.value = inc;
			} else if (!inc) {
				// Reset to default logic if no param
				// We don't force it here because applyIncludeModeForDate watcher on selectedSessionDate handles it naturally
				// when selectedSessionDate changes. But if selectedSessionDate didn't change (e.g. only include param removed),
				// we must trigger it.
				applyIncludeModeForDate();
			}

			// Search
			const s = (q.search as string) || "";
			if (s !== searchText.value) {
				searchText.value = s;
			}

			// Tab (handled in its own watcher setup or we can move it here)
			const tabVal = (q.tab as string) || "coders";
			if (
				["coders", "mentors"].includes(tabVal) &&
				tabVal !== selectedTab.value
			) {
				selectedTab.value = tabVal;
			}
		},
		{ deep: true },
	);

	// Sync Out (State -> URL)
	const updateUrl = () => {
		const query: Record<string, any> = { ...route.query };
		let changed = false;

		const setQuery = (key: string, val: string | undefined) => {
			const current = query[key];
			if (val) {
				if (current !== val) {
					query[key] = val;
					changed = true;
				}
			} else {
				if (current !== undefined) {
					delete query[key];
					changed = true;
				}
			}
		};

		setQuery("date", selectedSessionDate.value || undefined);
		setQuery("include", includeMode.value || undefined);
		setQuery("search", searchText.value || undefined);
		
		// Tab: default "coders" is implied by absence
		setQuery(
			"tab",
			selectedTab.value && selectedTab.value !== "coders"
				? selectedTab.value
				: undefined,
		);

		if (changed) {
			router.replace({ query });
		}
	};

	watch(
		[selectedSessionDate, includeMode, searchText, selectedTab],
		() => {
			updateUrl();
		},
	);

	const sessionYearOptions = computed(() => {
		return (SessionYears.value || []).map((y) => ({ value: y, label: y }));
	});

	const sessionDatesForSelectedYear = computed(() => {
		const year = selectedSessionYear.value;
		return (SessionDates.value || []).filter((d) => d.slice(0, 4) === year);
	});

	const sessionDateOptionsForSelectedYear = computed(() => {
		return (sessionDatesForSelectedYear.value || []).map((d) => ({
			value: d,
			label: d.slice(5), // MM-DD
		}));
	});

	const currentSessionDate = computed(() => CurrentSessionDate.value || "");
	const isCurrentSessionSelected = computed(() => {
		return (
			!!selectedSessionDate.value &&
			selectedSessionDate.value === currentSessionDate.value
		);
	});

	const applyIncludeModeForDate = () => {
		if (!selectedSessionDate.value) {
			return;
		}
		// Default to 'registered' if we are on the current session OR if the current session
		// date isn't loaded yet (avoiding a race condition that would flip to 'present').
		// Only switch to 'present' if we definitely know we are viewing a past session.
		if (isCurrentSessionSelected.value || !currentSessionDate.value) {
			includeMode.value = "registered";
		} else {
			includeMode.value = "present";
		}
	};

	watch(
		[() => currentSessionDate.value, () => SessionYears.value, selectedSessionYear],
		([cur, years, yearVal]) => {
			if (yearVal) {
				return;
			}
			const curYear = cur?.slice(0, 4) || "";
			selectedSessionYear.value = curYear || years?.[0] || "";
		},
		{ immediate: true },
	);

	watch(
		[
			() => selectedSessionYear.value,
			() => sessionDatesForSelectedYear.value,
			() => currentSessionDate.value,
		],
		([_year, dates, cur]) => {
			if (!dates?.length) {
				return;
			}
			if (selectedSessionDate.value && dates.includes(selectedSessionDate.value)) {
				// If the current internal date is valid for the list, keep it.
				// However, if we are in a "recovery" scenario where year is empty but date is set, ensure year is set.
				if (selectedSessionDate.value && !selectedSessionYear.value) {
					selectedSessionYear.value = selectedSessionDate.value.slice(0, 4);
				}
				return;
			}
			
			const target = (cur && dates.includes(cur) ? cur : "") || dates[0] || "";
			selectedSessionDate.value = target;

			if (target && !selectedSessionYear.value) {
				selectedSessionYear.value = target.slice(0, 4);
			}

			applyIncludeModeForDate();
		},
		{ immediate: true },
	);

	watch(
		() => selectedSessionDate.value,
		() => {
			applyIncludeModeForDate();
		},
	);

	const selectedAttendanceQuery = useSessionAttendanceForDate(selectedSessionDate);
	const selectedAttendanceData = computed(() => selectedAttendanceQuery.data.value);
	const selectedAttendanceMemberIds = computed(
		() => selectedAttendanceData.value?.memberIds || [],
	);
	const selectedPresentSet = computed(() => {
		return new Set(selectedAttendanceMemberIds.value);
	});

	const teamNameForMember = (member: MemberModel): string | null => {
		const teamId = member.teamId || "";
		if (!teamId) {
			return null;
		}
		return TeamsById.value[teamId]?.teamName || null;
	};

	const fullNameForMember = (member: MemberModel): string => {
		const first = member.nameFirst ?? "";
		const last = member.nameLast ?? "";
		return `${first} ${last}`.trim() || member.login || member.id;
	};

	const avatarTextForMember = (member: MemberModel): string => {
		const first = (member.nameFirst ?? "").trim();
		const last = (member.nameLast ?? "").trim();
		const a = first ? first[0] || "" : "";
		const b = last ? last[0] || "" : "";
		const initials = `${a}${b}`.toUpperCase();
		if (initials) {
			return initials;
		}
		return (member.login ?? member.id).slice(0, 2).toUpperCase();
	};

	const latestAwardedBeltIdByMemberId = computed<Record<string, string>>(() => {
		const map: Record<string, { beltId: string; ts: number }> = {};
		for (const mb of MemberBelts.value || []) {
			const ts = mb.awarded ?? mb.applicationDate ?? null;
			if (ts === null) {
				continue;
			}
			const prev = map[mb.memberId];
			if (!prev || ts > prev.ts) {
				map[mb.memberId] = { beltId: mb.beltId, ts };
			}
		}
		const out: Record<string, string> = {};
		for (const memberId of Object.keys(map)) {
			out[memberId] = map[memberId]?.beltId || "";
		}
		return out;
	});

	const beltInfoForMember = (memberId: string): {
		color: string | null;
		sortOrder: number;
	} => {
		const beltId = latestAwardedBeltIdByMemberId.value[memberId] || "";
		if (!beltId) {
			return { color: null, sortOrder: -1 };
		}
		const belt = BeltsById.value[beltId] || null;
		if (!belt) {
			return { color: null, sortOrder: -1 };
		}
		return {
			color: belt.color ?? null,
			sortOrder: belt.sortOrder,
		};
	};

	const allMembers = computed(() => {
		return (Members.value || []).filter((m) => !m.deleted);
	});

	const includeFilteredMembers = computed(() => {
		const mode = includeMode.value;
	if (mode === "all") {
			return allMembers.value;
		}
		if (mode === "registered") {
			// Mentors don't necessarily have term registration, but should still appear
			// when viewing registered attendees (current session default).
			// Also include any member marked present, even if not registered.
			return allMembers.value.filter(
				(m) =>
					m.registeredCurrentTerm ||
					m.isMentor ||
					selectedPresentSet.value.has(m.id),
			);
		}
		// present
		return allMembers.value.filter((m) => selectedPresentSet.value.has(m.id));
	});

	const searchedMembers = computed(() => {
		const q = searchText.value.trim().toLowerCase();
		if (!q) {
			return includeFilteredMembers.value;
		}
		return includeFilteredMembers.value.filter((m) => {
			const first = (m.nameFirst ?? "").toLowerCase();
			const last = (m.nameLast ?? "").toLowerCase();
			const login = (m.login ?? "").toLowerCase();
			return (
				first.includes(q) ||
				last.includes(q) ||
				`${first} ${last}`.includes(q) ||
				login.includes(q)
			);
		});
	});

	type AttendanceRow = {
		memberId: string;
		name: string;
		avatarText: string;
		team: string | null;
		beltColor: string | null;
		beltSortOrder: number;
		present: boolean;
		member: MemberModel;
	};

	const toRow = (member: MemberModel): AttendanceRow => {
		const belt = beltInfoForMember(member.id);
		return {
			memberId: member.id,
			name: fullNameForMember(member),
			avatarText: avatarTextForMember(member),
			team: teamNameForMember(member),
			beltColor: belt.color,
			beltSortOrder: belt.sortOrder,
			present: selectedPresentSet.value.has(member.id),
			member,
		};
	};

	const codersAllMembers = computed(() => {
		return allMembers.value.filter((m) => m.isNinja && !m.isMentor);
	});
	const mentorsAllMembers = computed(() => {
		return allMembers.value.filter((m) => m.isMentor);
	});

	const codersRows = computed(() => {
		return searchedMembers.value
			.filter((m) => m.isNinja && !m.isMentor)
			.map(toRow);
	});
	const mentorsRows = computed(() => {
		return searchedMembers.value.filter((m) => m.isMentor).map(toRow);
	});

	const codersPresentIds = computed(() => {
		return codersAllMembers.value
			.filter((m) => selectedPresentSet.value.has(m.id))
			.map((m) => m.id);
	});

	const mentorsPresentIds = computed(() => {
		return mentorsAllMembers.value
			.filter((m) => selectedPresentSet.value.has(m.id))
			.map((m) => m.id);
	});

	const codersPresentCount = computed(() => codersPresentIds.value.length);
	const mentorsPresentCount = computed(() => mentorsPresentIds.value.length);

	const tabItems = computed(() => [
		{ label: t("attendance.codersTitle"), slot: "coders", value: "coders" },
		{ label: t("attendance.mentorsTitle"), slot: "mentors", value: "mentors" },
	]);


	const codersPresentAll = computed(() => {
		return codersAllMembers.value.filter((m) => selectedPresentSet.value.has(m.id));
	});
	const canChooseRandomCoder = computed(() => codersPresentAll.value.length > 0);
	const chooseRandomCoder = async () => {
		const candidates = codersPresentAll.value;
		if (!candidates.length) {
			return;
		}
		const chosen = candidates[Math.floor(Math.random() * candidates.length)];
		if (!chosen?.id) {
			return;
		}
		await navigateTo(`/mentor/coder/${chosen.id}`);
	};

	const isSavingByMemberId = ref<Record<string, true>>({});

	const setMemberPresent = async (memberId: string, present: boolean) => {
		const sessionDate = selectedSessionDate.value;
		if (!sessionDate) {
			return;
		}

		isSavingByMemberId.value = {
			...isSavingByMemberId.value,
			[memberId]: true,
		};
		try {
			await setMemberPresentStore(memberId, sessionDate, present);
		} finally {
			const { [memberId]: _ignored, ...rest } = isSavingByMemberId.value;
			isSavingByMemberId.value = rest;
		}
	};

	type SingleSortState = { id: string; desc: boolean };

	const defaultSort: SingleSortState = { id: "name", desc: false };

	const toTableSorting = (single: SingleSortState): TableSortingState => {
		const primary = single?.id ? { id: single.id, desc: !!single.desc } : defaultSort;
		// Spec: only one user-selected sort column.
		// We still inject a hidden secondary sort by name asc (A-Z) to make ordering within
		// a primary group deterministic.
		return primary.id === "name" ? [primary] : [primary, { id: "name", desc: false }];
	};

	const fromTableSorting = (sorting: TableSortingState): SingleSortState => {
		const first = Array.isArray(sorting) && sorting.length ? sorting[0] : null;
		if (!first?.id) {
			return defaultSort;
		}
		return { id: first.id, desc: !!first.desc };
	};

	const codersSorting = ref<SingleSortState>({ ...defaultSort });
	const mentorsSorting = ref<SingleSortState>({ ...defaultSort });

	watch(
		() => selectedSessionDate.value,
		(next, prev) => {
			if (!next) {
				return;
			}
			if (next === prev) {
				return;
			}
			codersSorting.value = { ...defaultSort };
			mentorsSorting.value = { ...defaultSort };
		},
		{ immediate: true },
	);

	const MemberAvatar = resolveComponent("MemberAvatar") as unknown as Component;
	const UIcon = resolveComponent("UIcon") as unknown as Component;
	const UButton = resolveComponent("UButton") as unknown as Component;
	const UCheckbox = resolveComponent("UCheckbox") as unknown as Component;
	const UAvatar = resolveComponent("UAvatar") as unknown as Component;
	const UBadge = resolveComponent("UBadge") as unknown as Component;

	const makeSortableHeader = (
		getSort: () => SingleSortState,
		setSort: (next: SingleSortState) => void,
	) => {
		return (
			label: string,
			columnId: string,
			opts?: { canSort?: boolean; showIcons?: boolean },
		) => (_ctx: unknown) => {
			const sort = getSort();
			const isActive = sort.id === columnId;
			const canSort = opts?.canSort ?? true;
			const showIcons = opts?.showIcons ?? true;

			const inactiveIconClass = "text-muted opacity-60";
			const activeIconClass = "text-primary";

			return h(
				"button",
				{
					type: "button",
					disabled: !canSort,
					class:
						"flex items-center gap-2 select-none disabled:cursor-default disabled:opacity-60",
					onClick: () => {
						if (!canSort) {
							return;
						}
						if (isActive) {
							setSort({ id: columnId, desc: !sort.desc });
							return;
						}
						setSort({ id: columnId, desc: false });
					},
				},
				[
					h("span", { class: "text-sm font-semibold text-highlighted" }, label),
					showIcons
						? isActive
							? h(UIcon, {
									name: sort.desc
										? "i-lucide-chevron-down"
										: "i-lucide-chevron-up",
									class: `size-4 ${activeIconClass}`,
								})
							: h("span", { class: "flex flex-col -space-y-1" }, [
									h(UIcon, {
										name: "system-uicons-chevron-open",
										class: `size-3 ${inactiveIconClass}`,
									}),
								])
						: null,
				],
			);
		};
	};

	const codersColumns = computed(() => {
		const sortableHeader = makeSortableHeader(
			() => codersSorting.value,
			(next) => {
				codersSorting.value = next;
			},
		);

		return [
			{
				id: "present",
				key: "present",
				accessorKey: "present",
				header: sortableHeader(t("attendance.columns.present"), "present", {
					canSort: includeMode.value !== "present",
					showIcons: includeMode.value !== "present",
				}),
			},
			{
				id: "name",
				key: "name",
				accessorKey: "name",
				header: sortableHeader(t("attendance.columns.coder"), "name"),
			},
			{
				id: "team",
				key: "team",
				accessorKey: "team",
				header: sortableHeader(t("attendance.columns.team"), "team"),
			},
			{
				id: "beltColor",
				key: "beltColor",
				// Sort by belt order, not the display label.
				accessorFn: (row: AttendanceRow) => row.beltSortOrder,
				header: sortableHeader(t("attendance.columns.beltColor"), "beltColor"),
			},
		];
	});

	const mentorsColumns = computed(() => {
		const sortableHeader = makeSortableHeader(
			() => mentorsSorting.value,
			(next) => {
				mentorsSorting.value = next;
			},
		);

		return [
			{
				id: "present",
				key: "present",
				accessorKey: "present",
				header: sortableHeader(t("attendance.columns.present"), "present", {
					canSort: includeMode.value !== "present",
					showIcons: includeMode.value !== "present",
				}),
			},
			{
				id: "name",
				key: "name",
				accessorKey: "name",
				header: sortableHeader(t("attendance.columns.mentor"), "name"),
			},
		];
	});

	const codersTableProps = computed<Record<string, unknown>>(() => ({
		columns: codersColumns.value,
		data: codersRows.value,
		sticky: false,
		sorting: toTableSorting(codersSorting.value),
		"onUpdate:sorting": (v: TableSortingState) => {
			codersSorting.value = fromTableSorting(v);
		},
		loading: selectedAttendanceQuery.isLoading.value,
	}));

	const mentorsTableProps = computed<Record<string, unknown>>(() => ({
		columns: mentorsColumns.value,
		data: mentorsRows.value,
		sticky: false,
		sorting: toTableSorting(mentorsSorting.value),
		"onUpdate:sorting": (v: TableSortingState) => {
			mentorsSorting.value = fromTableSorting(v);
		},
		loading: selectedAttendanceQuery.isLoading.value,
	}));

</script>

<template>
	<UDashboardPanel id="mentor-attendance">
		<template #header>
				<DashboardHeading :page-title="pageTitle">
					<template #right>
						<div class="text-xs text-muted leading-tight mt-1 whitespace-nowrap">
							<div>Coders: {{ codersPresentCount }}</div>
							<div>Mentors: {{ mentorsPresentCount }}</div>
						</div>
					</template>
				</DashboardHeading>

			<UDashboardToolbar>
				<div class="flex flex-wrap items-end gap-x-10 gap-y-2 w-full">
					<UFormField :label="t('attendance.sessionDate')" size="xs">
						<div class="flex items-end gap-1">
							<USelect
								v-model="selectedSessionYear"
								:items="sessionYearOptions"
								value-key="value"
								label-key="label"
								size="xs"
								class="w-24"
								portal
							/>
							<USelect
								v-model="selectedSessionDate"
								:items="sessionDateOptionsForSelectedYear"
								value-key="value"
								label-key="label"
								size="xs"
								class="w-24"
								portal
							/>
						</div>
					</UFormField>

					<UFormField :label="t('attendance.include.label')" size="xs">
						<USelect
							v-model="includeMode"
							:items="includeOptions"
							value-key="value"
							label-key="label"
							size="xs"
							portal
						/>
					</UFormField>

					<UFormField :label="t('attendance.search.label')" size="xs">
						<UInput
							v-model="searchText"
							size="xs"
							:placeholder="t('attendance.search.placeholder')"
						/>
					</UFormField>

					<div v-if="isMembersLoading" class="text-xs opacity-70">
						{{ t("attendance.loadingRoster") }}
					</div>
					<div v-else-if="isMembersError" class="text-xs opacity-70">
						{{ t("attendance.errorLoadingRoster") }}
					</div>
				</div>
			</UDashboardToolbar>
		</template>

		<template #body>
				<UTabs v-model="selectedTab" :items="tabItems">
					<template #coders>
						<UTable v-bind="codersTableProps">
							<template #present-cell="{ row }">
								<UCheckbox
									:model-value="row.original.present"
									:disabled="!!isSavingByMemberId[row.original.memberId]"
									@update:model-value="(value: boolean) => setMemberPresent(row.original.memberId, value)"
								/>
							</template>
							<template #name-cell="{ row }">
								<div class="flex items-center gap-3">
									<MemberAvatar
										v-if="row.original.member"
										:member="row.original.member"
										size="xs"
									/>
									<span>{{ row.original.name }}</span>
								</div>
							</template>
							<template #team-cell="{ row }">
								{{ row.original.team || "-" }}
							</template>
							<template #beltColor-cell="{ row }">
								<UBadge
									:label="row.original.beltColor || '-'"
									color="neutral"
									variant="soft"
								/>
							</template>
						</UTable>
					<div
						v-if="canChooseRandomCoder"
						class="flex items-center justify-end pt-3 border-t border-default"
					>
						<UButton size="sm" @click="chooseRandomCoder">
							{{ t("attendance.footer.chooseRandomCoder") }}
						</UButton>
					</div>
				</template>
				<template #mentors>
					<UTable v-bind="mentorsTableProps">
						<template #present-cell="{ row }">
							<UCheckbox
								:model-value="row.original.present"
								:disabled="!!isSavingByMemberId[row.original.memberId]"
								@update:model-value="(value: boolean) => setMemberPresent(row.original.memberId, value)"
							/>
						</template>
						<template #name-cell="{ row }">
							<div class="flex items-center gap-3">
								<MemberAvatar
									v-if="row.original.member"
									:member="row.original.member"
									size="xs"
								/>
								<span>{{ row.original.name }}</span>
							</div>
						</template>
					</UTable>
				</template>
			</UTabs>
		</template>
	</UDashboardPanel>
</template>
