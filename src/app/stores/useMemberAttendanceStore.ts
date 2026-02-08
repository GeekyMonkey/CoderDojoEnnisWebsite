import { useQuery, useQueryClient } from "@tanstack/vue-query";
import type { AttendanceSignInResponseModel } from "#shared/types/AttendanceModels";
import type { MemberAttendanceSessionDateModel } from "#shared/types/models/MemberAttendanceSessionDateModel";
import type { MemberAttendanceSessionStatsCollection } from "#shared/types/models/MemberAttendanceSessionStatsModel";
import { IsYYYY_MM_dd, TodayYYYY_MM_dd } from "#shared/utils/DateHelpers";

// Using shared model: MemberAttendanceSessionStatsCollection

// Using shared model: MemberAttendanceSessionDateModel

interface UseMemberAttendanceStoreResult {
	SessionStats: Ref<MemberAttendanceSessionStatsCollection>;
	SessionDates: Ref<string[]>;
	SessionYears: Ref<string[]>;
	CurrentSessionMemberIds: Ref<string[]>;
	CurrentSessionDate: Ref<string>;
	TodaysDate: Ref<string>;
	useSessionAttendanceForDate: (
		sessionDate: MaybeRef<string>,
	) => ReturnType<typeof useQuery<MemberAttendanceSessionDateModel>>;
	// useSessionAttendanceForDateRange: (args: {
	// 	dateMin: MaybeRef<string>;
	// 	dateMax: MaybeRef<string>;
	// }) => ReturnType<typeof useQuery<MemberAttendanceSessionDateModel[]>>;
	isLoading: Ref<boolean>;
	isError: Ref<boolean>;
	error: Ref<unknown>;
	refetch: () => void;
	setMemberPresent: (
		memberId: string,
		sessionDate: string,
		present: boolean,
	) => Promise<void>;
	signInMember: (args: {
		username: string;
		password?: string;
	}) => Promise<ApiResponse<AttendanceSignInResponseModel>>;
	signInMemberByGuid: (args: {
		memberGuid: string;
	}) => Promise<ApiResponse<AttendanceSignInResponseModel>>;
	signInMemberByNfcTag: (args: {
		nfcTag: string;
	}) => Promise<ApiResponse<AttendanceSignInResponseModel>>;
}

let _store: UseMemberAttendanceStoreResult | null = null;

/**
 * Client-side store for attendance session stats with realtime invalidation on member_attendances changes.
 */
export function useMemberAttendanceStore(): UseMemberAttendanceStoreResult {
	if (_store) {
		return _store;
	}

	const queryClient = useQueryClient();

	const isSessionStatsEnabled = ref(false);

	/**
	 * Session Stats collection query
	 */
	const {
		data: SessionStats,
		isLoading: isLoadingStats,
		isError: isErrorStats,
		error: errorStats,
		refetch: refetchStats,
	} = useQuery<MemberAttendanceSessionStatsCollection>({
		queryKey: ["memberAttendanceSessionStats"],
		enabled: isSessionStatsEnabled,
		queryFn: async ({ signal }) => {
			const response = await $fetch<
				ApiResponse<MemberAttendanceSessionStatsCollection>
			>("/api/MemberAttendance/SessionStats", { signal });
			if (!response.success) {
				throw new Error(
					response.error || "Failed to load member attendance sessions",
				);
			}
			return response.data;
		},
		placeholderData: () => ({
			attendance_total: 0,
			sessionCount: 0,
			sessionStats: [],
		}),
		staleTime: 1000 * 60 * 5, // 5 minutes
		refetchOnWindowFocus: false,
	});

	/**
	 * Session Dates list query
	 */
	const { data: SessionDates } = useQuery<string[]>({
		queryKey: ["memberAttendanceSessionDates"],
		queryFn: async ({ signal }) => {
			const response = await $fetch<ApiResponse<{ dates: string[] }>>(
				"/api/MemberAttendance/SessionDates",
				{ signal },
			);
			if (!response.success) {
				throw new Error(
					response.error || "Failed to load member attendance session dates",
				);
			}
			return response.data.dates;
		},
		placeholderData: () => [],
		staleTime: 1000 * 60 * 5, // 5 minutes
		refetchOnWindowFocus: false,
	});

	/**
	 * Calculate current session date exclusively from the sessions list (latest date first)
	 */
	const CurrentSessionDate = computed(() => {
		if (!SessionDates.value?.length) {
			return "";
		}
		return SessionDates.value[0] || "";
	});

	/**
	 * Current local date in YYYY-MM-DD format
	 */
	const TodaysDate = computed(() => TodayYYYY_MM_dd());

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
	UseSupabaseRealtimeTable<MemberAttendanceModel>({
		table: "member_attendances",
		onInsert: (evt) => {
			console.log(`[MemberAttendanceStore][realtime] INSERT -> invalidate`, {
				evt,
			});
			// Invalidate relevant queries
			queryClient.invalidateQueries({
				queryKey: ["memberAttendanceSessionStats"],
			});
			queryClient.invalidateQueries({
				queryKey: ["memberAttendanceSessionDate", evt.newData.date],
				exact: false,
			});
		},
		onUpdate: (evt) => {
			// Nothing to do
		},
		onDelete: (evt) => {
			console.log(`[MemberAttendanceStore][realtime] DELETE -> invalidate`, {
				evt,
			});
			// Invalidate relevant queries
			queryClient.invalidateQueries({
				queryKey: ["memberAttendanceSessionStats"],
			});
			queryClient.invalidateQueries({
				queryKey: ["memberAttendanceSessionDate", evt.oldData.date],
			});
		},
	});

	/**
	 * Computed session years from complete sessions list
	 */
	const SessionYears = computed(() => {
		const years = new Set<string>();
		for (const date of SessionDates.value || []) {
			const year = date.slice(0, 4);
			years.add(year);
		}
		return [...years].sort((a, b) => b.localeCompare(a));
	});

	/**
	 * Computed member IDs for the current session date
	 */
	const CurrentSessionMemberIds = computed(
		() => currentSessionData.value?.memberIds || [],
	);

	/**
	 * On-demand query: get attendance for a date range (inclusive).
	 * Cached per (dateMin,dateMax) pair via queryKey.
	 */
	// const useSessionAttendanceForDateRange = ({
	// 	dateMin,
	// 	dateMax,
	// }: {
	// 	dateMin: MaybeRef<string>;
	// 	dateMax: MaybeRef<string>;
	// }) => {
	// 	const dateMinValue = computed(() => unref(dateMin) || "");
	// 	const dateMaxValue = computed(() => unref(dateMax) || "");
	// 	return useQuery<MemberAttendanceSessionDateModel[]>({
	// 		queryKey: computed(() => [
	// 			"memberAttendanceSessionDateRange",
	// 			dateMinValue.value,
	// 			dateMaxValue.value,
	// 		]),
	// 		enabled: computed(
	// 			() =>
	// 				IsYYYY_MM_dd(dateMinValue.value) &&
	// 				IsYYYY_MM_dd(dateMaxValue.value) &&
	// 				dateMinValue.value <= dateMaxValue.value,
	// 		),
	// 		queryFn: async ({ signal }) => {
	// 			const response = await $fetch<
	// 				ApiResponse<MemberAttendanceSessionDateModel[]>
	// 			>("/api/MemberAttendance/SessionDateRange", {
	// 				signal,
	// 				query: {
	// 					dateMin: dateMinValue.value,
	// 					dateMax: dateMaxValue.value,
	// 				},
	// 			});
	// 			if (!response.success) {
	// 				throw new Error(
	// 					response.error || "Failed to load session attendance range",
	// 				);
	// 			}
	// 			return response.data;
	// 		},
	// 		staleTime: 1000 * 60 * 5,
	// 		refetchOnWindowFocus: false,
	// 	});
	// };

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

		// let shouldInvalidateSessions = false;
		// if (previousDateData) {
		// 	const oldLen = previousDateData.memberIds.length;
		// 	const newLen = updateMemberIds(previousDateData.memberIds).length;
		// 	// Only invalidate sessions list if we transition between 0 and >0 attendance
		// 	// (i.e. creating or deleting a session entry effectively)
		// 	if ((oldLen === 0 && newLen > 0) || (oldLen > 0 && newLen === 0)) {
		// 		shouldInvalidateSessions = true;
		// 	}
		// } else {
		// 	// If we didn't have previous data, assume we might be creating a session entry
		// 	shouldInvalidateSessions = true;
		// }

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
			// if (shouldInvalidateSessions) {
			// 	queryClient.invalidateQueries({ queryKey: ["memberAttendanceSessionStats"] });
			// }
			// If optimistic update wasn't possible (no cache), we MUST refetch to show the change.
			// Even if it was possible, invalidating here ensures eventual consistency without
			// destroying the optimistic update state (since we use invalidateQueries not removeQueries).
			// However, to keep it snappy and avoid redundant network if not needed:
			// if (!didOptimisticUpdate) {
			// 	queryClient.invalidateQueries({ queryKey: queryKeyDate });
			// }
		}
	};

	/**
	 * Member signing in for attendance.
	 */
	const signInMember = async ({
		username,
		password,
	}: {
		username: string;
		password?: string;
	}) => {
		const response = await $fetch<ApiResponse<AttendanceSignInResponseModel>>(
			"/api/MemberAttendance/SignIn",
			{
				method: "POST",
				body: { username, password },
			},
		);
		return response;
	};

	/**
	 * Sign in a member using their GUID
	 */
	const signInMemberByGuid = async ({ memberGuid }: { memberGuid: string }) => {
		const response = await $fetch<ApiResponse<AttendanceSignInResponseModel>>(
			"/api/MemberAttendance/SignInGuid",
			{
				method: "POST",
				body: { memberGuid },
			},
		);
		return response;
	};

	/**
	 * Sign in a member using their NFC tag
	 */
	const signInMemberByNfcTag = async ({ nfcTag }: { nfcTag: string }) => {
		const response = await $fetch<ApiResponse<AttendanceSignInResponseModel>>(
			"/api/MemberAttendance/SignInNfcTag",
			{
				method: "POST",
				body: { nfcTag },
			},
		);
		return response;
	};

	_store = {
		SessionDates: SessionDates as Ref<string[]>,
		get SessionStats() {
			isSessionStatsEnabled.value = true;
			return SessionStats as Ref<MemberAttendanceSessionStatsCollection>;
		},
		SessionYears: SessionYears,
		CurrentSessionMemberIds: CurrentSessionMemberIds,
		CurrentSessionDate: CurrentSessionDate,
		TodaysDate: TodaysDate,
		useSessionAttendanceForDate,
		isLoading: computed(
			() => isSessionStatsEnabled.value && isLoadingStats.value,
		),
		isError: computed(() => isSessionStatsEnabled.value && isErrorStats.value),
		error: computed(() =>
			isSessionStatsEnabled.value ? errorStats.value : null,
		),
		refetch: () => {
			isSessionStatsEnabled.value = true;
			refetchStats();
		},
		setMemberPresent,
		signInMember,
		signInMemberByGuid,
		signInMemberByNfcTag,
	};

	return _store;
}
