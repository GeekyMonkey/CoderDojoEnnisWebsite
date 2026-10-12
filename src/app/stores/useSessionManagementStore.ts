import { useMutation, useQuery, useQueryClient, type QueryFunctionContext } from "@tanstack/vue-query";
import { computed, onScopeDispose, type ComputedRef, type Ref } from "vue";
import { z } from "zod";
import { managedSessionSchema, sessionManagementSchema, sessionFieldsSchema, sessionUpdateSchema, sessionDeleteSchema, type SessionManagement, type ManagedSession, type SessionFields, type SessionUpdate, type SessionDelete } from "#shared/types/SessionMaintenance";
import { coderSessionJoinSchema, coderSessionJoinedSchema, type CoderSessionJoined } from "#shared/types/CoderSession";
import { useProfileAuthorization } from "~/composables/useProfileAuthorization";
import { UseSupabaseRealtimeAllTables } from "~/composables/UseSupabaseRealtimeAllTables";

type PodWrite = { path: string; method: "POST" | "PATCH" | "DELETE"; body: SessionFields | SessionUpdate | SessionDelete | { sessionId: string } };
type SessionManagementStore = { data: ComputedRef<SessionManagement | null>; isPending: Ref<boolean>; isError: Ref<boolean>; isSaving: Ref<boolean>; create: (fields: SessionFields) => Promise<ManagedSession>; save: (id: string, body: SessionUpdate) => Promise<ManagedSession>; remove: (id: string, body: SessionDelete) => Promise<null>; join: (id: string) => Promise<CoderSessionJoined> };

/** Own validated mentor pod reads/writes and refresh all related attendance and session views. */
export function useSessionManagementStore(): SessionManagementStore {
 const user: ReturnType<typeof useSupabaseUser> = useSupabaseUser();
 const headers: ReturnType<typeof useProfileAuthorization> = useProfileAuthorization();
 const cache: ReturnType<typeof useQueryClient> = useQueryClient();
 const query: ReturnType<typeof useQuery<SessionManagement>> = useQuery<SessionManagement>({
  queryKey: computed((): readonly unknown[] => ["sessionPods", user.value?.email ?? ""]), enabled: computed((): boolean => Boolean(user.value)), retry: false, refetchInterval: 30_000,
  queryFn: async ({ signal }: QueryFunctionContext): Promise<SessionManagement> => sessionManagementSchema.parse(await $fetch("/api/Management/session-pods", { headers: await headers(), signal })),
 });
 /** Invalidate shared queries after any local write or remote pod/host change. */
 async function reload(): Promise<void> { await Promise.all(["sessionPods", "coder", "memberAttendanceHistory", "memberAttendances", "memberMaintenance"].map((key: string): Promise<void> => cache.invalidateQueries({ queryKey: [key] }))); }
 const mutation: ReturnType<typeof useMutation<unknown, Error, PodWrite>> = useMutation<unknown, Error, PodWrite>({ mutationFn: async (write: PodWrite): Promise<unknown> => $fetch(`/api/Management/session-pods${write.path}`, { method: write.method, headers: await headers(), body: write.body }), onSettled: reload });
 const realtime: ReturnType<typeof UseSupabaseRealtimeAllTables> = UseSupabaseRealtimeAllTables();
 /** Refresh after remote lifecycle changes or host role/name/image changes. */
 function invalidate(event: { table: string }): void { if (["session_pods", "members"].includes(event.table)) void reload(); }
 realtime.events.on("INSERT", invalidate); realtime.events.on("UPDATE", invalidate); realtime.events.on("DELETE", invalidate);
 onScopeDispose((): void => { realtime.events.off("INSERT", invalidate); realtime.events.off("UPDATE", invalidate); realtime.events.off("DELETE", invalidate); });
 /** Create a new pod through strict editable fields. */
 async function create(fields: SessionFields): Promise<ManagedSession> { return managedSessionSchema.parse(await mutation.mutateAsync({ path: "", method: "POST", body: sessionFieldsSchema.parse(fields) })); }
 /** Save a selected pod using its exact original snapshot. */
 async function save(id: string, body: SessionUpdate): Promise<ManagedSession> { return managedSessionSchema.parse(await mutation.mutateAsync({ path: `/${z.uuid().parse(id)}`, method: "PATCH", body: sessionUpdateSchema.parse(body) })); }
 /** Archive a confirmed pod and return null when there is no result value. */
 async function remove(id: string, body: SessionDelete): Promise<null> { await mutation.mutateAsync({ path: `/${z.uuid().parse(id)}`, method: "DELETE", body: sessionDeleteSchema.parse(body) }); return null; }
 /** Record authenticated mentor attendance and return the validated external URL. */
 async function join(id: string): Promise<CoderSessionJoined> { return coderSessionJoinedSchema.parse(await mutation.mutateAsync({ path: "/join", method: "POST", body: coderSessionJoinSchema.parse({ sessionId: id }) })); }
 return { data: computed((): SessionManagement | null => query.data.value ?? null), isPending: query.isPending, isError: query.isError, isSaving: mutation.isPending, create, save, remove, join };
}
