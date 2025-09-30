import { useQuery, useQueryClient } from "@tanstack/vue-query";
import type { MemberAttendanceSessionCurrentModel } from "~~/shared/types/models/MemberAttendanceSessionCurrentModel";
import type { MemberAttendanceSessionsModel } from "~~/shared/types/models/MemberAttendanceSessionsModel";
import { UseSupabaseRealtimeAllTables } from "../composables/UseSupabaseRealtimeAllTables";

// Using shared model: MemberAttendanceSessionsModel

// Using shared model: MemberAttendanceSessionCurrentModel

interface UseMemberAttendanceStoreResult {
	SessionStats: Ref<MemberAttendanceSessionsModel["sessionStats"]>;
	SessionCount: Ref<number>;
	AttendanceTotal: Ref<number>;
	CurrentSessionMemberIds: Ref<string[]>;
	CurrentSessionDate: Ref<string>;
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
		useQuery<MemberAttendanceSessionsModel>({
			queryKey: ["memberAttendanceSessions"],
			queryFn: async ({ signal }) => {
				const response = await $fetch<
					ApiResponse<MemberAttendanceSessionsModel>
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
		useQuery<MemberAttendanceSessionCurrentModel>({
			queryKey: ["memberAttendanceSessionCurrent"],
			queryFn: async ({ signal }) => {
				const response = await $fetch<
					ApiResponse<MemberAttendanceSessionCurrentModel>
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

	_store = {
		SessionStats: SessionStats as Ref<
			MemberAttendanceSessionsModel["sessionStats"]
		>,
		SessionCount: SessionCount as Ref<number>,
		AttendanceTotal: AttendanceTotal as Ref<number>,
		CurrentSessionMemberIds: CurrentSessionMemberIds as Ref<string[]>,
		CurrentSessionDate: CurrentSessionDate as Ref<string>,
		IsMemberPresent,
		isLoading: isLoading as Ref<boolean>,
		isError: isError as Ref<boolean>,
		error: error as Ref<unknown>,
		refetch: () => refetch(),
		refetchCurrent: () => refetchCurrent(),
	};

	return _store;
}
