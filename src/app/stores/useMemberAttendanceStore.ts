import { useQuery, useQueryClient } from "@tanstack/vue-query";
import type { AttendanceSignInResponseModel } from "~~/shared/types/AttendanceModels";
import type { MemberAttendanceSessionDateModel } from "~~/shared/types/models/MemberAttendanceSessionDateModel";
import type { MemberAttendanceSessionStatsCollection } from "~~/shared/types/models/MemberAttendanceSessionStatsModel";
import { IsYYYY_MM_dd } from "~~/shared/utils/DateHelpers";
import { UseSupabaseRealtimeAllTables } from "../composables/UseSupabaseRealtimeAllTables";

// Using shared model: MemberAttendanceSessionStatsCollection

// Using shared model: MemberAttendanceSessionDateModel

interface UseMemberAttendanceStoreResult {
	SessionStats: Ref<MemberAttendanceSessionStatsCollection["sessionStats"]>;
	SessionYears: Ref<string[]>;
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
	isLoading: Ref<boolean>;
	isError: Ref<boolean>;
	error: Ref<unknown>;
	refetch: () => void;
	setMemberPresent: (
		memberId: string,
		sessionDate: string,
		present: boolean,
	) => Promise<void>;
	signInMember: (
		args: { username: string; password?: string },
	) => Promise<ApiResponse<AttendanceSignInResponseModel>>;
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

	const SessionStats = computed(() => data.value?.sessionStats || []);

	// Calculate current session date exclusively from the sessions list (latest date first)
	const CurrentSessionDate = computed(() => {
		if (!SessionStats.value.length) return "";
		const dates = SessionStats.value.map((s) => s.date).sort((a, b) =>
			b.localeCompare(a),
		);
		return dates[0] || "";
	});

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

	// Use regular session date query to get "current" session details
	const { data: currentSessionData } =
		useSessionAttendanceForDate(CurrentSessionDate);

	// Realtime invalidation: minimal logging + background refresh (avoid removeQueries to prevent UI flicker)
	const { events: allEvents } = UseSupabaseRealtimeAllTables();
	const TARGET_TABLE = "member_attendances";
	const invalidate = (action: string) => {
		// console.log(`[MemberAttendanceStore][realtime] ${action} -> invalidate`);

		// Only invalidate sessions list if strictly necessary?
		// For now, only on INSERT/DELETE to avoid spamming on UPDATE (e.g. metadata changes)
		// But attendance toggle might be an INSERT/DELETE of a row, or UPDATE of a `present` column.
		// Assuming rows are present entries:
		if (action !== "UPDATE") {
			queryClient.invalidateQueries({ queryKey: ["memberAttendanceSessions"] });
		}

		// Use invalidateQueries (refetch) instead of removeQueries (destroy cache) so UI stays populated
		queryClient.invalidateQueries({
			queryKey: ["memberAttendanceSessionDate"],
			exact: false,
		});
		queryClient.invalidateQueries({
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

	const SessionYears = computed(() => {
		const years = new Set<string>();
		for (const stat of SessionStats.value) {
			const date = stat.date;
			// Expecting YYYY-MM-DD; be defensive.
			const year = typeof date === "string" ? date.slice(0, 4) : "";
			if (year.length === 4) years.add(year);
		}
		return [...years].sort((a, b) => b.localeCompare(a));
	});
	const SessionCount = computed(() => data.value?.sessionCount || 0);
	const AttendanceTotal = computed(() => data.value?.attendance_total || 0);
	const CurrentSessionMemberIds = computed(
		() => currentSessionData.value?.memberIds || [],
	);

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

	/**
	 * Set a member as present/absent for a specific session date.
	 */
	const setMemberPresent = async (
		memberId: string,
		sessionDate: string,
		present: boolean,
	) => {
		const queryKeyDate = ["memberAttendanceSessionDate", sessionDate];

		// Cancel any outgoing refetches (so they don't overwrite our optimistic update)
		await queryClient.cancelQueries({ queryKey: queryKeyDate });

		// Snapshot the previous value
		const previousDateData =
			queryClient.getQueryData<MemberAttendanceSessionDateModel>(queryKeyDate);

		const updateMemberIds = (ids: string[]) => {
			if (present) {
				return ids.includes(memberId) ? ids : [...ids, memberId];
			}
			return ids.filter((id) => id !== memberId);
		};

		// Optimistically update
		let didOptimisticUpdate = false;
		if (previousDateData) {
			queryClient.setQueryData(queryKeyDate, {
				...previousDateData,
				memberIds: updateMemberIds(previousDateData.memberIds),
			});
			didOptimisticUpdate = true;
		}

		let shouldInvalidateSessions = false;
		if (previousDateData) {
			const oldLen = previousDateData.memberIds.length;
			const newLen = updateMemberIds(previousDateData.memberIds).length;
			// Only invalidate sessions list if we transition between 0 and >0 attendance
			// (i.e. creating or deleting a session entry effectively)
			if ((oldLen === 0 && newLen > 0) || (oldLen > 0 && newLen === 0)) {
				shouldInvalidateSessions = true;
			}
		} else {
			// If we didn't have previous data, assume we might be creating a session entry
			shouldInvalidateSessions = true;
		}

		try {
			const response = await $fetch<ApiResponse<unknown>>(
				"/api/MemberAttendance/SetPresent",
				{
					method: "POST",
					body: { memberId, sessionDate, present },
				},
			);
			if (!response.success) {
				throw new Error(response.error || "Failed to update attendance");
			}
		} catch (err) {
			// Rollback on error
			if (previousDateData) {
				queryClient.setQueryData(queryKeyDate, previousDateData);
			}
			throw err;
		} finally {
			// Ensure background consistency
			if (shouldInvalidateSessions) {
				queryClient.invalidateQueries({ queryKey: ["memberAttendanceSessions"] });
			}

			// If optimistic update wasn't possible (no cache), we MUST refetch to show the change.
			// Even if it was possible, invalidating here ensures eventual consistency without
			// destroying the optimistic update state (since we use invalidateQueries not removeQueries).
			// However, to keep it snappy and avoid redundant network if not needed:
			if (!didOptimisticUpdate) {
				queryClient.invalidateQueries({ queryKey: queryKeyDate });
			}
		}
	};

	/**
	 * Member signing in for attendance.
	 */
	const signInMember = async ({
		username,
		password,
	}: { username: string; password?: string }) => {
		const response = await $fetch<ApiResponse<AttendanceSignInResponseModel>>(
			"/api/MemberAttendance/SignIn",
			{
				method: "POST",
				body: { username, password },
			},
		);

		if (response.success) {
			if (CurrentSessionDate.value) {
				queryClient.invalidateQueries({
					queryKey: ["memberAttendanceSessionDate", CurrentSessionDate.value],
				});
			}
		}
		return response;
	};

	_store = {
		SessionStats: SessionStats as Ref<
			MemberAttendanceSessionStatsCollection["sessionStats"]
		>,
		SessionYears: SessionYears as Ref<string[]>,
		SessionCount: SessionCount as Ref<number>,
		AttendanceTotal: AttendanceTotal as Ref<number>,
		CurrentSessionMemberIds: CurrentSessionMemberIds as Ref<string[]>,
		CurrentSessionDate: CurrentSessionDate as Ref<string>,
		useSessionAttendanceForDate,
		useSessionAttendanceForDateRange,
		isLoading: isLoading as Ref<boolean>,
		isError: isError as Ref<boolean>,
		error: error as Ref<unknown>,
		refetch: () => refetch(),
		setMemberPresent,
		signInMember,
	};

	return _store;
}
