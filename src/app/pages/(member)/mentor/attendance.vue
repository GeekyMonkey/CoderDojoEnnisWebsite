<script setup lang="ts">
	import { useMemberAttendanceStore } from "~/stores/useMemberAttendanceStore";
	import { useMembersStore } from "~/stores/useMembersStore";

	definePageMeta({
		layout: "member-layout",
	});

	const { pageTitle } = useMemberLayoutContext();
	const { t } = useI18n();

	type IncludeMode = "present" | "registered" | "all";

	const includeOptions = computed<{ value: IncludeMode; label: string }[]>(() => [
		{ value: "present", label: t("attendance.include.presentMembers") },
		{ value: "registered", label: t("attendance.include.registeredMembers") },
		{ value: "all", label: t("attendance.include.allMembers") },
	]);

	const { SessionStats, SessionYears, CurrentSessionDate } =
		useMemberAttendanceStore();
	const { isLoading: isMembersLoading, isError: isMembersError } = useMembersStore();

	const selectedSessionYear = ref<string>("");
	const selectedSessionDate = ref<string>("");
	const includeMode = ref<IncludeMode>("registered");
	const searchText = ref<string>("");

	const sessionYearOptions = computed(() => {
		return (SessionYears.value || []).map((y) => ({ value: y, label: y }));
	});

	const sessionDatesForSelectedYear = computed(() => {
		const year = selectedSessionYear.value;
		const stats = [...(SessionStats.value || [])].sort((a, b) =>
			b.date.localeCompare(a.date),
		);
		const dates = stats.map((s) => s.date);
		if (!year) return dates;
		return dates.filter((d) => d.slice(0, 4) === year);
	});

	const sessionDateOptionsForSelectedYear = computed(() => {
		return (sessionDatesForSelectedYear.value || []).map((d) => ({
			value: d,
			label: d.slice(5), // MM-DD
		}));
	});

	const currentSessionDate = computed(() => CurrentSessionDate.value || "");
	const isCurrentSessionSelected = computed(
		() =>
			!!selectedSessionDate.value &&
			selectedSessionDate.value === currentSessionDate.value,
	);

	const applyIncludeModeForDate = () => {
		if (!selectedSessionDate.value) return;
		includeMode.value = isCurrentSessionSelected.value
			? "registered"
			: "present";
	};

	watch(
		[() => currentSessionDate.value, () => SessionYears.value],
		([cur, years]) => {
			if (selectedSessionYear.value) return;
			const curYear = cur?.slice(0, 4) || "";
			selectedSessionYear.value =
				curYear || years?.[0] || new Date().getFullYear().toString();
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
			if (!dates?.length) return;
			if (selectedSessionDate.value && dates.includes(selectedSessionDate.value)) {
				return;
			}
			selectedSessionDate.value =
				(cur && dates.includes(cur) ? cur : "") || dates[0] || "";
			applyIncludeModeForDate();
		},
		{ immediate: true },
	);

	watch(
		() => selectedSessionDate.value,
		() => {
			// Task 4.6: date-change rule updates the Include option
			applyIncludeModeForDate();
		},
	);
</script>

<template>
	<UDashboardPanel id="mentor-attendance">
		<template #header>
			<DashboardHeading :page-title="pageTitle" />

			<UDashboardToolbar>
					<div class="flex flex-wrap items-end gap-10 w-full">
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
			<div class="p-4 space-y-4">
				<UPageCard>
					<section class="grid gap-1">
						<h3 class="text-base font-semibold">{{ t("attendance.codersTitle") }}</h3>
						<p class="text-sm opacity-70">
							Tables, sorting, totals, and toggling are implemented in tasks 4.3–4.5.
						</p>
					</section>
				</UPageCard>

				<UPageCard>
					<section class="grid gap-1">
						<h3 class="text-base font-semibold">{{ t("attendance.mentorsTitle") }}</h3>
						<p class="text-sm opacity-70">
							Mentors table is implemented in task 4.4.
						</p>
					</section>
				</UPageCard>
			</div>
		</template>
	</UDashboardPanel>
</template>
