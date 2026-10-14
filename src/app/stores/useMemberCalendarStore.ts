import {
	computed,
	onScopeDispose,
	toValue,
	type ComputedRef,
	type Ref,
	type MaybeRefOrGetter,
} from "vue";
import {
	useMutation,
	useQuery,
	useQueryClient,
	type QueryFunctionContext,
} from "@tanstack/vue-query";
import { z } from "zod";
import {
	calendarFieldsSchema,
	calendarSessionSchema,
	calendarUpdateSchema,
	calendarDeleteSchema,
	memberCalendarSchema,
	type CalendarView,
	type CalendarFields,
	type CalendarUpdate,
	type CalendarDelete,
	type CalendarSession,
	type MemberCalendar,
} from "#shared/types/MemberCalendar";
import {
	coderSessionJoinedSchema,
	type CoderSessionJoined,
} from "#shared/types/CoderSession";
import { useMyProfileStore } from "./useMyProfileStore";
import { useProfileAuthorization } from "~/composables/useProfileAuthorization";
import { UseSupabaseRealtimeAllTables } from "~/composables/UseSupabaseRealtimeAllTables";

type CalendarWrite = {
	path: string;
	method: "POST" | "PATCH" | "DELETE";
	body:
		CalendarFields | CalendarUpdate | CalendarDelete | { sessionId: string };
};
type MemberCalendarStore = {
	data: ComputedRef<MemberCalendar | null>;
	session: ComputedRef<CalendarSession | null>;
	isPending: Ref<boolean>;
	isError: Ref<boolean>;
	detailPending: Ref<boolean>;
	detailError: Ref<boolean>;
	isSaving: Ref<boolean>;
	isMentor: ComputedRef<boolean>;
	create: (fields: CalendarFields) => Promise<CalendarSession>;
	save: (id: string, body: CalendarUpdate) => Promise<CalendarSession>;
	remove: (id: string, body: CalendarDelete) => Promise<void>;
	join: (id: string) => Promise<CoderSessionJoined>;
};
/** Own Calendar reads, mentor mutations, role-sensitive caching, and pod joining. */
export function useMemberCalendarStore(
	view: MaybeRefOrGetter<CalendarView> = "future",
	sessionId: MaybeRefOrGetter<string | null> = null,
	access: MaybeRefOrGetter<"public" | "member"> = "member",
): MemberCalendarStore {
	const user: ReturnType<typeof useSupabaseUser> = useSupabaseUser();
	const profile: ReturnType<typeof useMyProfileStore> = useMyProfileStore();
	const headers: ReturnType<typeof useProfileAuthorization> =
		useProfileAuthorization();
	const cache: ReturnType<typeof useQueryClient> = useQueryClient();
	const memberAccess: ComputedRef<boolean> = computed(
		(): boolean => toValue(access) === "member" && Boolean(user.value),
	);
	const identity: ComputedRef<string> = computed((): string =>
		memberAccess.value
			? `${user.value?.email ?? ""}:${profile.profile.value?.isMentor}:${profile.profile.value?.isParent}:${profile.profile.value?.isNinja}`
			: "public",
	);
	const query: ReturnType<typeof useQuery<MemberCalendar>> =
		useQuery<MemberCalendar>({
			queryKey: computed((): readonly unknown[] => [
				"memberCalendar",
				identity.value,
				toValue(view),
			]),
			enabled: computed(
				(): boolean => !memberAccess.value || Boolean(profile.profile.value),
			),
			retry: false,
			refetchInterval: 30_000,
			queryFn: async ({
				signal,
			}: QueryFunctionContext): Promise<MemberCalendar> =>
				memberCalendarSchema.parse(
					await $fetch(
						memberAccess.value ? "/api/member/calendar" : "/api/calendar",
						{
							headers: memberAccess.value ? await headers() : undefined,
							query: { view: toValue(view) },
							signal,
						},
					),
				),
		});
	const detail: ReturnType<typeof useQuery<CalendarSession>> =
		useQuery<CalendarSession>({
			queryKey: computed((): readonly unknown[] => [
				"calendarSession",
				identity.value,
				toValue(sessionId),
			]),
			enabled: computed((): boolean =>
				Boolean(
					memberAccess.value &&
					profile.profile.value?.isMentor &&
					z.uuid().safeParse(toValue(sessionId)).success,
				),
			),
			retry: false,
			queryFn: async ({
				signal,
			}: QueryFunctionContext): Promise<CalendarSession> =>
				calendarSessionSchema.parse(
					await $fetch(
						`/api/Management/calendar-sessions/${z.uuid().parse(toValue(sessionId))}`,
						{ headers: await headers(), signal },
					),
				),
		});
	/** Refresh all calendar/detail views and attendance after an actual pod join. */
	async function reload(): Promise<void> {
		await Promise.all(
			[
				"memberCalendar",
				"calendarSession",
				"memberAttendanceSessionDates",
				"memberAttendanceSessionStats",
				"memberAttendanceSessionDate",
				"memberAttendanceHistory",
				"coder",
				"parent",
			].map((key: string): Promise<void> =>
				cache.invalidateQueries({ queryKey: [key] }),
			),
		);
	}
	const mutation: ReturnType<
		typeof useMutation<unknown, Error, CalendarWrite>
	> = useMutation<unknown, Error, CalendarWrite>({
		mutationFn: async (write: CalendarWrite): Promise<unknown> =>
			$fetch(write.path, {
				method: write.method,
				headers: await headers(),
				body: write.body,
			}),
		onSettled: reload,
	});
	/** Create a dated session after validating editable fields. */
	async function create(fields: CalendarFields): Promise<CalendarSession> {
		return calendarSessionSchema.parse(
			await mutation.mutateAsync({
				path: "/api/Management/calendar-sessions",
				method: "POST",
				body: calendarFieldsSchema.parse(fields),
			}),
		);
	}
	/** Save a dated session against the revision originally opened for editing. */
	async function save(
		id: string,
		body: CalendarUpdate,
	): Promise<CalendarSession> {
		return calendarSessionSchema.parse(
			await mutation.mutateAsync({
				path: `/api/Management/calendar-sessions/${z.uuid().parse(id)}`,
				method: "PATCH",
				body: calendarUpdateSchema.parse(body),
			}),
		);
	}
	/** Soft-delete the confirmed version of a session without changing attendance. */
	async function remove(id: string, body: CalendarDelete): Promise<void> {
		await mutation.mutateAsync({
			path: `/api/Management/calendar-sessions/${z.uuid().parse(id)}`,
			method: "DELETE",
			body: calendarDeleteSchema.parse(body),
		});
	}
	/** Join an active permitted pod and let the server record today's attendance. */
	async function join(id: string): Promise<CoderSessionJoined> {
		return coderSessionJoinedSchema.parse(
			await mutation.mutateAsync({
				path: "/api/member/calendar/join",
				method: "POST",
				body: { sessionId: z.uuid().parse(id) },
			}),
		);
	}
	const realtime: ReturnType<typeof UseSupabaseRealtimeAllTables> =
		UseSupabaseRealtimeAllTables();
	/** Refresh on sessions, pods, attendance, and membership changes. */
	function invalidate(event: { table: string }): void {
		if (
			["sessions", "session_pods", "members", "member_attendances"].includes(
				event.table,
			)
		)
			void reload();
	}
	realtime.events.on("INSERT", invalidate);
	realtime.events.on("UPDATE", invalidate);
	realtime.events.on("DELETE", invalidate);
	onScopeDispose((): void => {
		realtime.events.off("INSERT", invalidate);
		realtime.events.off("UPDATE", invalidate);
		realtime.events.off("DELETE", invalidate);
	});
	return {
		data: computed((): MemberCalendar | null => {
			const data: MemberCalendar | undefined = query.data.value;
			if (query.isError.value || !data) return null;
			if (
				memberAccess.value &&
				profile.profile.value?.isMentor &&
				data.isMentor
			)
				return data;
			return {
				...data,
				isMentor: false,
				sessions: data.sessions.filter(
					(entry): boolean => entry.sessionType !== "MENTOR_PLANNING",
				),
				pods: memberAccess.value
					? data.pods.filter((pod): boolean => !pod.mentorsOnly)
					: [],
			};
		}),
		session: computed((): CalendarSession | null =>
			memberAccess.value &&
			profile.profile.value?.isMentor &&
			!detail.isError.value
				? (detail.data.value ?? null)
				: null,
		),
		isPending: query.isPending,
		isError: query.isError,
		detailPending: detail.isPending,
		detailError: detail.isError,
		isSaving: mutation.isPending,
		isMentor: computed(
			(): boolean =>
				memberAccess.value &&
				profile.profile.value?.isMentor === true &&
				query.data.value?.isMentor === true,
		),
		create,
		save,
		remove,
		join,
	};
}
