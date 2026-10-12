import { computed, type ComputedRef } from "vue";
import { useMemberAttendanceStore } from "./useMemberAttendanceStore";
type MemberPresenceStore = { presentById: ComputedRef<Record<string, boolean> | null> };
/** Share latest-session attendance with lists instead of subscribing once per photo. */
export function useMemberPresenceStore(): MemberPresenceStore {
 const attendance: ReturnType<typeof useMemberAttendanceStore> = useMemberAttendanceStore();
 const session: ReturnType<typeof attendance.useSessionAttendanceForDate> = attendance.useSessionAttendanceForDate(attendance.CurrentSessionDate);
 const presentById: ComputedRef<Record<string, boolean> | null> = computed((): Record<string, boolean> | null => attendance.CurrentSessionDate.value === "" && !attendance.isLoading.value && !attendance.isError.value ? {} : session.data.value ? Object.fromEntries(session.data.value.memberIds.map((id: string): [string, boolean] => [id, true])) : null);
 return { presentById };
}
