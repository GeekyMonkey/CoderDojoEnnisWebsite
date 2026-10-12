import { useQuery, useQueryClient, type QueryFunctionContext } from "@tanstack/vue-query";
import { computed, onScopeDispose, toValue, type MaybeRefOrGetter, type Ref, type ComputedRef } from "vue";
import { attendanceHistorySchema } from "#shared/types/MemberMaintenance";
import { profileIdentitySchema } from "#shared/types/MemberProfile";
import type { MemberAttendanceModel } from "#shared/types/models/MemberAttendanceModel";
import { useProfileAuthorization } from "~/composables/useProfileAuthorization";
import { UseSupabaseRealtimeAllTables } from "~/composables/UseSupabaseRealtimeAllTables";

type AttendanceHistoryStore = { data: ComputedRef<MemberAttendanceModel[] | null>; isPending: Ref<boolean>; isError: Ref<boolean> };

/** Cache individual attendance and refresh it when another session records attendance. */
export function useMemberAttendanceHistoryStore(memberId: MaybeRefOrGetter<string | null>, parent: boolean = false): AttendanceHistoryStore {
	const headers: ReturnType<typeof useProfileAuthorization> = useProfileAuthorization();
	const user: ReturnType<typeof useSupabaseUser> = useSupabaseUser();
	const queryClient: ReturnType<typeof useQueryClient> = useQueryClient();
	const query: ReturnType<typeof useQuery<MemberAttendanceModel[]>> = useQuery<MemberAttendanceModel[]>({
		queryKey: computed((): readonly unknown[] => ["memberAttendanceHistory", user.value?.email ?? "", toValue(memberId), parent]),
		enabled: computed((): boolean => Boolean(user.value) && (toValue(memberId) === null || profileIdentitySchema.safeParse(toValue(memberId)).success)),
		queryFn: async ({ signal }: QueryFunctionContext): Promise<MemberAttendanceModel[]> => attendanceHistorySchema.parse(await $fetch(toValue(memberId) === null ? "/api/Coder/attendance" : `/api/${parent ? "Parent/children" : "Management"}/${profileIdentitySchema.parse(toValue(memberId))}/attendance`, { headers: await headers(), signal })),
		retry: false,
	});
	const realtime: ReturnType<typeof UseSupabaseRealtimeAllTables> = UseSupabaseRealtimeAllTables();
	/** Refresh history after remote attendance changes. */
	function invalidate(event: { table: string }): void { if (["member_attendances", "member_parents", "members"].includes(event.table)) void queryClient.invalidateQueries({ queryKey: ["memberAttendanceHistory"] }); }
	realtime.events.on("INSERT", invalidate); realtime.events.on("UPDATE", invalidate); realtime.events.on("DELETE", invalidate);
	onScopeDispose((): void => { realtime.events.off("INSERT", invalidate); realtime.events.off("UPDATE", invalidate); realtime.events.off("DELETE", invalidate); });
	return { data: computed((): MemberAttendanceModel[] | null => query.isError.value ? null : query.data.value ?? null), isPending: query.isPending, isError: query.isError };
}
