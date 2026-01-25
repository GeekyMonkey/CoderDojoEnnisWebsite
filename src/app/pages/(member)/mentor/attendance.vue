<script setup lang="ts">
	import { h, resolveComponent, type Component } from "vue";
	import type { ColumnDef } from '@tanstack/vue-table';
	import type { MemberModel } from "~~/shared/types/models/MemberModel";
	import { useBeltsStore } from "~/stores/useBeltsStore";
	import { useMemberAttendanceStore } from "~/stores/useMemberAttendanceStore";
	import { useMemberBeltsStore } from "~/stores/useMemberBeltsStore";
	import { useMembersStore } from "~/stores/useMembersStore";
	import { useTeamsStore } from "~/stores/useTeamsStore";

	type SingleSortState = { id: string; desc: boolean };
	type TableSortingState = SingleSortState[];

	type IncludeMode = "present" | "registered" | "all";

	type AttendanceRow = {
		memberId: string;
		name: string;
		team: string | null;
		beltColor: string | null;
		beltSortOrder: number;
		present: boolean;
		member: MemberModel;
	};

	definePageMeta({
		layout: "member-layout",
	});

	const { pageTitle } = useMemberLayoutContext();
	const { t } = useI18n();
	const route = useRoute();
	const router = useRouter();
	const { width: windowWidth } = useWindowSize();
	const { speak } = useSpeechSynth();

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
		MembersById,
		isLoading: isMembersLoading,
		isError: isMembersError,
	} = useMembersStore();

	const { TeamsById } = useTeamsStore();
	const { BeltsById } = useBeltsStore();
	const { MembersLatestBeltsByMemberId } = useMemberBeltsStore();
	const { signInMemberByGuid, signInMemberByNfcTag } = useMemberAttendanceStore();
	const log = useLogger("mentor/attendance");
	
	const initialDate = (route.query.date as string) || "";
	const initialYear = initialDate.length >= 4 ? initialDate.slice(0, 4) : "";
	const defaultSort: SingleSortState = { id: "name", desc: false };
	const codersSorting = ref<SingleSortState>({ ...defaultSort });
	const mentorsSorting = ref<SingleSortState>({ ...defaultSort });
	const scannerActive = ref(route.query.qr === "1" || false);
	const nfcActive = ref(route.query.nfc === "1" || false);
	const isSubmitting = ref(false);
	const highlightedMemberId = ref<string | null>(null);

	const UIcon = resolveComponent("UIcon") as unknown as Component;

	const selectedSessionYear = ref<string>(initialYear);
	const selectedSessionDate = ref<string>(initialDate);
	const includeMode = ref<IncludeMode>((route.query.include as IncludeMode) || "registered");
	const searchText = ref<string>((route.query.search as string) || "");
	const selectedAttendanceQuery = useSessionAttendanceForDate(selectedSessionDate);

	const initTab = (route.query.tab as string) || "coders";
	const selectedTab = ref<string>(
		["coders", "mentors"].includes(initTab) ? initTab : "coders",
	);

	/**
	 * Sync Out (State -> URL)
	 */
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
		setQuery("qr", scannerActive.value ? "1" : undefined);
		setQuery("nfc", nfcActive.value ? "1" : undefined);
		
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

	/**
	 * Session year options
	 */
	const sessionYearOptions = computed(() => {
		return (SessionYears.value || []).map((y) => ({ value: y, label: y }));
	});

	/**
	 * Session dates for selected year
	 */
	const sessionDateOptionsForSelectedYear = computed(() => {
		const year = selectedSessionYear.value;
		return (SessionDates.value || [])
			.filter((d) => d.slice(0, 4) === year)
			.map((d) => ({
				value: d,
				label: d.slice(5), // MM-DD
			})
		);
	});

	/**
	 * Is the selected date the most recent session date?
	 */
	const isCurrentSessionSelected = computed(() => {
		return (
			!!selectedSessionDate.value &&
			selectedSessionDate.value === CurrentSessionDate.value
		);
	});

	/**
	 * When the selected session date changes, apply the default include mode logic
	 */
	const applyIncludeModeForDate = () => {
		if (!selectedSessionDate.value) {
			return;
		}
		// Default to 'registered' if we are on the current session OR if the current session
		// date isn't loaded yet (avoiding a race condition that would flip to 'present').
		// Only switch to 'present' if we definitely know we are viewing a past session.
		if (isCurrentSessionSelected.value || !CurrentSessionDate.value) {
			includeMode.value = "registered";
		} else {
			includeMode.value = "present";
		}
	};

	/**
	 * Set of member IDs marked present for the selected session date
	 */
	const selectedPresentSet = computed(() => {
		return new Set(selectedAttendanceQuery.data.value?.memberIds || []);
	});

	/**
	 * Team names by member ID
	 */
	const teamNamesByMemberId = computed(() => {
		const map: Record<string, string | null> = {};
		for (const member of includeFilteredMembers.value) {
			const teamId = member.teamId || "";
			map[member.id] = !teamId ? null : TeamsById.value[teamId]?.teamName || null;
		}
		return map;
	});

	/**
	 * Full names by member ID
	 */
	const fullNamesByMemberId = computed(() => {
		const map: Record<string, string> = {};
		for (const member of includeFilteredMembers.value) {
			const first = member.nameFirst ?? "";
			const last = member.nameLast ?? "";
			map[member.id] = `${first} ${last}`.trim() || member.login || member.id;
		}
		return map;
	});

	/**
	 * Belt info for member
	 */
	const beltInfoForMember = (memberId: string): {
		color: string | null;
		sortOrder: number;
	} => {
		const beltId = MembersLatestBeltsByMemberId.value[memberId]?.beltId || "";
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

	/**
	 * All members (not deleted)
	 */
	const allMembers = computed(() => {
		return (Members.value || []).filter((m) => !m.deleted);
	});

	/**
	 * Members filtered by include mode
	 */
	const includeFilteredMembers = computed<MemberModel[]>(() => {
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

	/**
	 * Members filtered by search text
	 */
	const searchedMembers = computed<MemberModel[]>(() => {
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

	/**
	 * Coders Member List
	 */
	const codersAllMembers = computed(() => {
		return allMembers.value.filter((m) => m.isNinja && !m.isMentor);
	});

	/**
	 * Mentors Member List
	 */
	const mentorsAllMembers = computed(() => {
		return allMembers.value.filter((m) => m.isMentor);
	});

	/**
	 * Coders Table Rows
	 */
	const codersRows = computed(() => {
		return searchedMembers.value
			.filter((m) => m.isNinja && !m.isMentor)
			.map((member) => {
				const belt = beltInfoForMember(member.id);
		return {
			memberId: member.id,
			name: fullNamesByMemberId.value[member.id],
			team: teamNamesByMemberId.value[member.id],
			beltColor: belt.color,
			beltSortOrder: belt.sortOrder,
			present: selectedPresentSet.value.has(member.id),
			member,
		};
			});
	});

	/**
	 * Mentors Table Rows
	 */
	const mentorsRows = computed(() => {
		return searchedMembers.value
			.filter((m) => m.isMentor)
			.map((member) => {
				return {
					memberId: member.id,
					name: fullNamesByMemberId.value[member.id],
					team: teamNamesByMemberId.value[member.id],
					beltColor: "",
					beltSortOrder: 0,
					present: selectedPresentSet.value.has(member.id),
					member,
				};
			});
	});

	/**
	 * Present Coder IDs
	 */
	const codersPresentIds = computed<string[]>(() => {
		return codersAllMembers.value
			.filter((m) => selectedPresentSet.value.has(m.id))
			.map((m) => m.id);
	});

	/**
	 * Mentors Present IDs
	 */
	const mentorsPresentIds = computed<string[]>(() => {
		return mentorsAllMembers.value
			.filter((m) => selectedPresentSet.value.has(m.id))
			.map((m) => m.id);
	});

	/**
	 * Coders Present Count
	 */
	const codersPresentCount = computed<number>(() => codersPresentIds.value.length);

	/**
	 * Mentors Present Count
	 */
	const mentorsPresentCount = computed<number>(() => mentorsPresentIds.value.length);

	/**
	 * Tab Items
	 */
	const tabItems = computed(() => [
		{ label: t("coders.plural"), slot: "coders", value: "coders" },
		{ label: t("mentors.plural"), slot: "mentors", value: "mentors" },
	]);

	/**
	 * All Present Coders
	 */
	const codersPresentAll = computed<MemberModel[]>(() => {
		return codersAllMembers.value.filter((m) => selectedPresentSet.value.has(m.id));
	});

	/**
	 * Should the choose random coder button be shown?
	 */
	const canChooseRandomCoder = computed(() => codersPresentAll.value.length > 0);

	/**
	 * Choose a random coder from those present and navigate to their coder page
	 */
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

	/**
	 * Member clicked - navigate to their coder page
	 */
	const MemberClicked = async (member: MemberModel) => {
		if (!member.id) {
			return;
		}
		if (member.isMentor) {
			await navigateTo(`/mentor/mentor/${member.id}`);
		} else {
			await navigateTo(`/mentor/coder/${member.id}`);
		}
	};

	const isSavingByMemberId = ref<Record<string, true>>({});

	/**
	 * Handle NFC message -> NFC tag sign in
	 */
	const handleNfcMessage = async ({ serialNumber, message }: { serialNumber: string; message: NDEFMessage }): Promise<void> => {
		log.info("[SignIn][NFC] detected NFC tag", { serialNumber });

		isSubmitting.value = true;
		try {
			const result = await signInMemberByNfcTag({ nfcTag: serialNumber });
			log.info("[SignIn][NFC] result:", result);
			if (result.success) {
				await applySignInSuccess(result.data.memberDetails);
				return;
			}
		} catch (err) {
			log.error("[SignIn][NFC] POST error", { error: ErrorToString(err) }, err);
		} finally {
			isSubmitting.value = false;
		}
	};

	const handleNfcError = async (message: string): Promise<void> => {
		log.error("NFC Error", { error: message });
	};

	/**
	 * Set Member Present status for the selected session date
	 */
	const setMemberPresent = async (memberId: string, present: boolean): Promise<void> => {
		const sessionDate = selectedSessionDate.value;
		if (!sessionDate) {
			return;
		}

		// Highlight changed member
		highlightedMemberId.value = memberId;

		if (present) {
			const member = MembersById.value[memberId];
			if (member) {
				await applySignInSuccess(member);
			}
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

	/**
	 * Convert single-column sort state to table sorting state
	 */
	const toTableSorting = (single: SingleSortState): TableSortingState => {
		const primary = single?.id ? { id: single.id, desc: !!single.desc } : defaultSort;
		// Spec: only one user-selected sort column.
		// We still inject a hidden secondary sort by name asc (A-Z) to make ordering within
		// a primary group deterministic.
		return primary.id === "name" ? [primary] : [primary, { id: "name", desc: false }];
	};

	/**
	 * Convert table sorting state to single-column sort state
	 */
	const fromTableSorting = (sorting: TableSortingState): SingleSortState => {
		const first = Array.isArray(sorting) && sorting.length ? sorting[0] : null;
		if (!first?.id) {
			return defaultSort;
		}
		return { id: first.id, desc: !!first.desc };
	};

	/**
	 * Creates a sortable table header renderer.
	 */
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
						`Header_${columnId} flex items-center gap-2 select-none disabled:cursor-default disabled:opacity-60`,
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
					h("span", { class: `HeaderText text-sm font-semibold text-highlighted` }, label),
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

	/**
	 * Coders Table Columns
	 */
	const codersColumns = computed<ColumnDef<AttendanceRow>[]>(() => {
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
				header: sortableHeader("" /*t("attendance.columns.present")*/, "present", {
					canSort: includeMode.value !== "present",
					showIcons: includeMode.value !== "present",
				}),
			},
			{
				id: "name",
				key: "name",
				accessorKey: "name",
				header: sortableHeader(t("coders.label"), "name"),
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

	/**
	 * Mentors Table Columns
	 */
	const mentorsColumns = computed<ColumnDef<AttendanceRow>[]>(() => {
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
				header: sortableHeader("" /*t("attendance.columns.present")*/, "present", {
					canSort: includeMode.value !== "present",
					showIcons: includeMode.value !== "present",
				}),
			},
			{
				id: "name",
				key: "name",
				accessorKey: "name",
				header: sortableHeader(t("mentors.label"), "name"),
			},
		];
	});

	/**
	 * Coders Table Props
	 */
	const codersTableProps = computed(() => ({
		columns: codersColumns.value,
		data: codersRows.value,
		sticky: false,
		sorting: toTableSorting(codersSorting.value),
		"onUpdate:sorting": (v: TableSortingState | undefined) => {
			codersSorting.value = fromTableSorting(v || []);
		},
		loading: selectedAttendanceQuery.isLoading.value,
	}));

	/**
	 * Mentors Table Props
	 */
	const mentorsTableProps = computed(() => ({
		columns: mentorsColumns.value,
		data: mentorsRows.value,
		sticky: false,
		sorting: toTableSorting(mentorsSorting.value),
		"onUpdate:sorting": (v: TableSortingState | undefined) => {
			mentorsSorting.value = fromTableSorting(v || []);
		},
		loading: selectedAttendanceQuery.isLoading.value,
	}));

	/**
	 * Handle QR decode -> GUID sign in
	 */
	const handleGuidDecoded = async (memberGuid: string) => {
		const trimmed = memberGuid?.trim();
		if (!trimmed) {
			return;
		}

		log.info("[SignIn][QR] decoded GUID", { memberGuid: trimmed });

		isSubmitting.value = true;
		try {
			const result = await signInMemberByGuid({ memberGuid: trimmed });
			log.info("[SignIn][QR] result:", result);
			if (result.success) {
				await applySignInSuccess(result.data.memberDetails);
				return;
			}
		// 	errorMessage.value = result.error || t("signIn.qrErrorFallback");
		} catch (err) {
			const message: string = ErrorToString(err);
			log.error("[SignIn][QR] POST error", undefined, err);
		// 	errorMessage.value = message;
		} finally {
			isSubmitting.value = false;
		}
	};

	const handleScannerError = (message: string): void => {
		console.error("QR Scanner Error:", message);
	};

	/**
	 * Apply successful sign-in result to UI
	 */
	const applySignInSuccess = async (member: MemberModel) => {
		isSubmitting.value = false;
		const memberId: string = member.id;
		if (!member) {
			log.warn("Signed-in member not found in store", { memberId });
			return;
		}
		log.info("QR Signed in", { member });

		// Speak the member's name
		const memberName = `${member.nameFirst || ""} ${member.nameLast || ""}`.trim();
		if (memberName) {
			speak(memberName);
		}

		// Highlight the member row
		highlightedMemberId.value = memberId;

		// Focus the correct tab
		if (member.isMentor) {
			selectedTab.value = "mentors";
			log.info("Switching to mentors tab for signed-in mentor");
		} else {
			selectedTab.value = "coders";
			log.info("Switching to coders tab for signed-in coder");
		}

		// Let the screen refresh, and then scroll the member into view
		await nextTick();
		await sleep(500);
		const rowId = `MemberRow_${memberId}`;
		log.info("Scrolling to member row", { rowId });
		const memberRow = document.getElementById(rowId);
		if (memberRow) {
			memberRow.scrollIntoView({ behavior: "smooth", block: "center" });
		}
	};


	// --- Watches for state syncing ---

	/**
	 * State syncing with URL query params
	 * Sync In (URL -> State)
	 */
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

			// NFC Active
			const nfcVal = q.nfc === "1";
			if (nfcVal !== nfcActive.value) {
				nfcActive.value = nfcVal;
			}
		},
		{ deep: true },
	);

	/**
	 * State syncing with URL query params
	 * Sync Out (State -> URL)
	 */
	watch(
		[selectedSessionDate, includeMode, searchText, selectedTab, scannerActive, nfcActive],
		() => {
			updateUrl();
		},
	);

	/**
	 * When the session years or current session date change, ensure selected year is valid
	 * (probably not necessary but a safety measure)
	 */
	watch(
		[() => CurrentSessionDate.value, () => SessionYears.value, selectedSessionYear],
		([cur, years, yearVal]) => {
			if (yearVal) {
				return;
			}
			const curYear = cur?.slice(0, 4) || "";
			selectedSessionYear.value = curYear || years?.[0] || "";
		},
		{ immediate: true },
	);

	/**
	 * When session year, session dates, or current session date change,
	 * ensure selected date is valid and apply include mode logic
	 * (probably not necessary but a safety measure)
	 */
	watch(
		[
			() => selectedSessionYear.value,
			() => sessionDateOptionsForSelectedYear.value,
			() => CurrentSessionDate.value,
		],
		([_year, dates, cur]) => {
			if (!dates?.length) {
				return;
			}
			const dateValues = dates.map((d) => d.value);
			if (selectedSessionDate.value && dateValues.includes(selectedSessionDate.value)) {
				// If the current internal date is valid for the list, keep it.
				// However, if we are in a "recovery" scenario where year is empty but date is set, ensure year is set.
				if (selectedSessionDate.value && !selectedSessionYear.value) {
					selectedSessionYear.value = selectedSessionDate.value.slice(0, 4);
				}
				return;
			}
			
			const target = (cur && dateValues.includes(cur) ? cur : "") || dates[0]?.value || "";
			selectedSessionDate.value = target;

			if (target && !selectedSessionYear.value) {
				selectedSessionYear.value = target.slice(0, 4);
			}

			applyIncludeModeForDate();
		},
		{ immediate: true },
	);

	/**
	 * When selected session date changes, apply default include mode logic
	 */
	watch(
		() => selectedSessionDate.value,
		() => {
			applyIncludeModeForDate();
		},
	);
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
				<div class="AttendanceDashboardToolbar w-full">
					<div class="AttendanceHeaderInputs items-end gap-x-10 gap-y-2 pb-1">

						<UFormField :label="t('attendance.sessionDate')" size="xs">
							<div class="flex items-end gap-1">
								<USelect
									v-model="selectedSessionYear"
									:items="sessionYearOptions"
									value-key="value"
									label-key="label"
									size="xs"
									portal
									/>
								<USelect
									v-model="selectedSessionDate"
									:items="sessionDateOptionsForSelectedYear"
									value-key="value"
									label-key="label"
									size="xs"
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
							
							<UFormField :label="t('labels.search')" size="xs">
								<UInput
								v-model="searchText"
								size="xs"
								placeholder=""
								/>
							</UFormField>
						</div>

						<div class="QrScanner" v-if="isCurrentSessionSelected">
							<QrCodeReader
								v-if="scannerActive"
								:active="scannerActive"
								@decoded="handleGuidDecoded"
								@error="handleScannerError"
								@toggle="scannerActive = !scannerActive"
								>
							</QrCodeReader>
							<UButton
								v-if="!scannerActive"
								variant="ghost"
								color="primary"
								icon="i-lucide-camera"
								aria-label="Toggle QR scanner"
								@click="scannerActive = !scannerActive"
							/>
							<NfcToggle
								:on-message="handleNfcMessage"
								:on-error="handleNfcError"
							/>
						</div>
					</div>
				</UDashboardToolbar>
			</template>
			
			<!-- Tabs and Tables -->
			<template #body>
				<UTabs v-model="selectedTab" :items="tabItems" class="AttendanceTabs">
				<template #coders>

					<!-- Coders Table -->
					<UTable v-bind="codersTableProps" class="CodersTable">
						<template #present-cell="{ row }">
							<div 
								:id="`MemberRow_${row.original.memberId}`"
								:data-highlighted="row.original.memberId === highlightedMemberId ? 'true' : 'false'"
							>
								<UCheckbox
									class="PresentCheckbox"
									:model-value="row.original.present"
									:disabled="!!isSavingByMemberId[row.original.memberId]"
									@update:model-value="(value: boolean) => setMemberPresent(row.original.memberId, value)"
								/>
							</div>
						</template>
						<template #name-cell="{ row }">
							<div class="flex items-center gap-3">
								<MemberAvatar
									v-if="row.original.member"
									:member="row.original.member"
									size="sm"
								/>
								<span class="MemberName" @click="MemberClicked(row.original.member)">{{ row.original.name }}</span>
							</div>
						</template>
						<template #team-cell="{ row }">
							<div class="TeamCell">
								<TeamLogo
									:for="row.original.member"
									size="sm"
								/>
								<div class="TeamName">
									{{ row.original.team || "-" }}
								</div>
							</div>
						</template>
						<template #beltColor-cell="{ row }">
							<MemberBelt :member="row.original.member" :size="windowWidth >= 768 ? 'md' : 'sm'" />
						</template>
					</UTable>

					<!-- Footer: Choose Random Coder -->
					<div
						v-if="canChooseRandomCoder"
						class="CoderTableFooter flex items-center justify-end pt-3 border-t border-default"
					>
						<UButton size="sm" @click="chooseRandomCoder">
							{{ t("attendance.footer.chooseRandomCoder") }}
						</UButton>
					</div>
				</template>

				<!-- Mentors Table -->
				<template #mentors>
					<UTable v-bind="mentorsTableProps" class="MentorsTable">
						<template #present-cell="{ row }">
							<div 
								:id="`MemberRow_${row.original.memberId}`"
								:data-highlighted="row.original.memberId === highlightedMemberId ? 'true' : 'false'"
							>
								<UCheckbox
									class="PresentCheckbox"
									:model-value="row.original.present"
									:disabled="!!isSavingByMemberId[row.original.memberId]"
									@update:model-value="(value: boolean) => setMemberPresent(row.original.memberId, value)"
								/>
							</div>
						</template>
						<template #name-cell="{ row }">
							<div class="MemberAvatarNameCell flex items-center gap-3">
								<MemberAvatar
									v-if="row.original.member"
									:member="row.original.member"
									size="sm"
								/>
								<span class="MemberName" @click="MemberClicked(row.original.member)">{{ row.original.name }}</span>
							</div>
						</template>
					</UTable>
				</template>
			</UTabs>
		</template>
	</UDashboardPanel>
</template>

<style lang="scss">
	.TeamCell {
		display: flex;
		align-items: center;
		gap: 0.5rem;

		.TeamName {
			flex-grow: 1;
		}
	}

	.AttendanceTabs {
		max-width: 800px;
	}

	.CodersTable {
		max-width: 800px;
	}

	.MentorsTable {
		max-width: 500px;
	}

	.CodersTable,.MentorsTable {
		thead {
			tr {
				th:first-child {
					padding: 0;
				}

				.Header_beltColor {
					.HeaderText {
						@media (max-width: 640px) {
							display: none;
						}
					}
				}
			}
		}
		tbody {
			.MemberName {
				cursor: pointer;
				&:hover {
					text-decoration: underline;
				}
			}

			/* Target rows containing a highlighted cell */
			tr:has([data-highlighted="true"]) {
				td:not(:has([role="checkbox"])) {
					background: var(--ui-bg-inverted);
					color: var(--ui-text-inverted);
				}
			}

			.HighlightedRow_true {
				background: var(--ui-bg-inverted);
				color: var(--ui-text-inverted);
			}
		}
	}

	.PresentCheckbox {
		[role="checkbox"] {
		}
	}

	.MemberBelt {
		margin: 0 auto;
	}

	.AttendanceDashboardToolbar {
		width: 100%;
		display: flex;
		flex-wrap: nowrap;
		align-items: center;

		.AttendanceHeaderInputs {
			display: flex;
			flex-wrap: wrap;
			flex-grow: 1;
		}
		.QrScanner {
			max-width: min(30vw, 170px);
			margin-bottom: 0.5rem;
		}
	}
</style>