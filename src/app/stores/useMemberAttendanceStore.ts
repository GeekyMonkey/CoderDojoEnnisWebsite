import { useQuery, useQueryClient } from "@tanstack/vue-query";
import type { MemberAttendanceSessionDateModel } from "~~/shared/types/models/MemberAttendanceSessionDateModel";
import type { MemberAttendanceSessionStatsCollection } from "~~/shared/types/models/MemberAttendanceSessionStatsModel";
import { IsYYYY_MM_dd } from "~~/shared/utils/DateHelpers";
import { UseSupabaseRealtimeAllTables } from "../composables/UseSupabaseRealtimeAllTables";

// Using shared model: MemberAttendanceSessionStatsCollection

// Using shared model: MemberAttendanceSessionDateModel

interface UseMemberAttendanceStoreResult {
	SessionStats: Ref<MemberAttendanceSessionStatsCollection["sessionStats"]>;
	SessionCount: Ref<number>;
	AttendanceTotal: Ref<number>;
	CurrentSessionMemberIds: Ref<string[]>;
	CurrentSessionDate: Ref<string>;
	useSessionAttendanceForDate: (
		sessionDate: MaybeRef<string>,
	) => ReturnType<typeof useQuery<MemberAttendanceSessionDateModel>>;
	useSessionAttendanceForDateRange: (args: {
		dateMin: MaybeRef<string>;
		dateMax: MaybeRef<string>;
	}) => ReturnType<typeof useQuery<MemberAttendanceSessionDateModel[]>>;
	IsMemberPresent: (memberId: string) => boolean;
	isLoading: Ref<boolean>;
	isError: Ref<boolean>;
	error: Ref<unknown>;
	refetch: () => void;
	refetchCurrent: () => void;
}

let _store: UseMemberAttendanceStoreResult | null = null;

/**
 * Client-side store for attendance session stats with realtime invalidation on member_attendances changes.
 */
export function useMemberAttendanceStore(): UseMemberAttendanceStoreResult {
	if (_store) return _store;

	const queryClient = useQueryClient();

	const { data, isLoading, isError, error, refetch } =
		useQuery<MemberAttendanceSessionStatsCollection>({
			queryKey: ["memberAttendanceSessions"],
			queryFn: async ({ signal }) => {
				const response = await $fetch<
					ApiResponse<MemberAttendanceSessionStatsCollection>
				>("/api/MemberAttendance/Sessions", { signal });
				if (!response.success)
					throw new Error(
						response.error || "Failed to load member attendance sessions",
					);
				return response.data;
			},
			staleTime: 1000 * 60 * 5, // 5 minutes
			refetchOnWindowFocus: false,
		});

	// Current session (most recent) attendance list
	const { data: currentData, refetch: refetchCurrent } =
		useQuery<MemberAttendanceSessionDateModel>({
			queryKey: ["memberAttendanceSessionCurrent"],
			queryFn: async ({ signal }) => {
				const response = await $fetch<
					ApiResponse<MemberAttendanceSessionDateModel>
				>("/api/MemberAttendance/SessionCurrent", { signal });
				if (!response.success)
					throw new Error(
						response.error || "Failed to load current session attendance",
					);
				return response.data;
			},
			staleTime: 1000 * 30, // fresher (30s) since this can change rapidly during sign-in
			refetchOnWindowFocus: false,
		});

	// Realtime invalidation: minimal logging + immediate invalidate
	const { events: allEvents } = UseSupabaseRealtimeAllTables();
	const TARGET_TABLE = "member_attendances";
	const invalidate = (action: string) => {
		console.log(`[MemberAttendanceStore][realtime] ${action} -> invalidate`);
		queryClient.invalidateQueries({ queryKey: ["memberAttendanceSessions"] });
		queryClient.invalidateQueries({
			queryKey: ["memberAttendanceSessionCurrent"],
		});
		// Clear any per-date/range caches so they refetch when next used
		queryClient.removeQueries({
			queryKey: ["memberAttendanceSessionDate"],
			exact: false,
		});
		queryClient.removeQueries({
			queryKey: ["memberAttendanceSessionDateRange"],
			exact: false,
		});
	};
	allEvents.on("INSERT", (evt) => {
		if (evt.table === TARGET_TABLE) invalidate("INSERT");
	});
	allEvents.on("UPDATE", (evt) => {
		if (evt.table === TARGET_TABLE) invalidate("UPDATE");
	});
	allEvents.on("DELETE", (evt) => {
		if (evt.table === TARGET_TABLE) invalidate("DELETE");
	});

	const SessionStats = computed(() => data.value?.sessionStats || []);
	const SessionCount = computed(() => data.value?.sessionCount || 0);
	const AttendanceTotal = computed(() => data.value?.attendance_total || 0);
	const CurrentSessionMemberIds = computed(
		() => currentData.value?.memberIds || [],
	);
	const CurrentSessionDate = computed(
		() => currentData.value?.sessionDate || "",
	);
	const IsMemberPresent = (memberId: string) =>
		CurrentSessionMemberIds.value.includes(memberId);

	/**
	 * On-demand query: get attendance for a specific session date.
	 * Cached per date via queryKey.
	 */
	const useSessionAttendanceForDate = (sessionDate: MaybeRef<string>) => {
		const sessionDateValue = computed(() => unref(sessionDate) || "");
		return useQuery<MemberAttendanceSessionDateModel>({
			queryKey: computed(() => [
				"memberAttendanceSessionDate",
				sessionDateValue.value,
			]),
			enabled: computed(() => IsYYYY_MM_dd(sessionDateValue.value)),
			queryFn: async ({ signal }) => {
				const date = sessionDateValue.value;
				const response = await $fetch<
					ApiResponse<MemberAttendanceSessionDateModel>
				>("/api/MemberAttendance/SessionDate", {
					signal,
					query: { sessionDate: date },
				});
				if (!response.success) {
					throw new Error(
						response.error || "Failed to load session attendance",
					);
				}
				return response.data;
			},
			staleTime: 1000 * 60 * 5,
			refetchOnWindowFocus: false,
		});
	};

	/**
	 * On-demand query: get attendance for a date range (inclusive).
	 * Cached per (dateMin,dateMax) pair via queryKey.
	 */
	const useSessionAttendanceForDateRange = ({
		dateMin,
		dateMax,
	}: {
		dateMin: MaybeRef<string>;
		dateMax: MaybeRef<string>;
	}) => {
		const dateMinValue = computed(() => unref(dateMin) || "");
		const dateMaxValue = computed(() => unref(dateMax) || "");
		return useQuery<MemberAttendanceSessionDateModel[]>({
			queryKey: computed(() => [
				"memberAttendanceSessionDateRange",
				dateMinValue.value,
				dateMaxValue.value,
			]),
			enabled: computed(
				() =>
					IsYYYY_MM_dd(dateMinValue.value) &&
					IsYYYY_MM_dd(dateMaxValue.value) &&
					dateMinValue.value <= dateMaxValue.value,
			),
			queryFn: async ({ signal }) => {
				const response = await $fetch<
					ApiResponse<MemberAttendanceSessionDateModel[]>
				>("/api/MemberAttendance/SessionDateRange", {
					signal,
					query: {
						dateMin: dateMinValue.value,
						dateMax: dateMaxValue.value,
					},
				});
				if (!response.success) {
					throw new Error(
						response.error || "Failed to load session attendance range",
					);
				}
				return response.data;
			},
			staleTime: 1000 * 60 * 5,
			refetchOnWindowFocus: false,
		});
	};

	_store = {
		SessionStats: SessionStats as Ref<
			MemberAttendanceSessionStatsCollection["sessionStats"]
		>,
		SessionCount: SessionCount as Ref<number>,
		AttendanceTotal: AttendanceTotal as Ref<number>,
		CurrentSessionMemberIds: CurrentSessionMemberIds as Ref<string[]>,
		CurrentSessionDate: CurrentSessionDate as Ref<string>,
		useSessionAttendanceForDate,
		useSessionAttendanceForDateRange,
		IsMemberPresent,
		isLoading: isLoading as Ref<boolean>,
		isError: isError as Ref<boolean>,
		error: error as Ref<unknown>,
		refetch: () => refetch(),
		refetchCurrent: () => refetchCurrent(),
	};

	return _store;
}
