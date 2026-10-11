import { useMutation, useQuery, useQueryClient, type QueryFunctionContext } from "@tanstack/vue-query";
import { computed, onScopeDispose, type ComputedRef, type Ref } from "vue";
import { teamFieldsSchema, teamUpdateSchema, teamDeleteSchema, teamIdSchema, teamListSchema, type TeamFields, type TeamUpdate, type TeamDelete } from "#shared/types/TeamMaintenance";
import { TeamModelSchema, type TeamModel } from "#shared/types/models/TeamModel";
import { useProfileAuthorization } from "~/composables/useProfileAuthorization";
import { UseSupabaseRealtimeAllTables } from "~/composables/UseSupabaseRealtimeAllTables";
type TeamWrite = { path: string; method: "POST" | "PATCH" | "DELETE"; body: TeamFields | TeamUpdate | TeamDelete };
type TeamMaintenanceStore = { teams: ComputedRef<TeamModel[]>; isPending: Ref<boolean>; isError: Ref<boolean>; isSaving: Ref<boolean>; create: (fields: TeamFields) => Promise<TeamModel>; save: (id: string, body: TeamUpdate) => Promise<TeamModel>; remove: (id: string, body: TeamDelete) => Promise<TeamModel> };
/** Own team requests, shared query caching and remote refresh for all dependent views. */
export function useTeamMaintenanceStore(): TeamMaintenanceStore {
 const user: ReturnType<typeof useSupabaseUser> = useSupabaseUser();
 const headers: ReturnType<typeof useProfileAuthorization> = useProfileAuthorization();
 const client: ReturnType<typeof useQueryClient> = useQueryClient();
 const query: ReturnType<typeof useQuery<TeamModel[]>> = useQuery<TeamModel[]>({
  queryKey: computed((): readonly unknown[] => ["teamMaintenance", user.value?.email ?? ""]),
  enabled: computed((): boolean => Boolean(user.value)), staleTime: 30_000, retry: false,
  queryFn: async ({ signal }: QueryFunctionContext): Promise<TeamModel[]> => teamListSchema.parse(await $fetch("/api/Management/teams", { headers: await headers(), signal })),
 });
 /** Refresh teams and member lookup caches after local or remote writes. */
 async function reload(): Promise<void> { await Promise.all(["teamMaintenance", "teams", "memberMaintenance"].map((key: string): Promise<void> => client.invalidateQueries({ queryKey: [key] }))); }
 const mutation: ReturnType<typeof useMutation<TeamModel, Error, TeamWrite>> = useMutation<TeamModel, Error, TeamWrite>({
  mutationFn: async (write: TeamWrite): Promise<TeamModel> => TeamModelSchema.parse(await $fetch(`/api/Management/teams${write.path}`, { method: write.method, headers: await headers(), body: write.body })), onSettled: reload,
 });
 /** Create a team using strict editable fields. */
 async function create(fields: TeamFields): Promise<TeamModel> { return mutation.mutateAsync({ path: "", method: "POST", body: teamFieldsSchema.parse(fields) }); }
 /** Save a team only when its expected snapshot remains current. */
 async function save(id: string, body: TeamUpdate): Promise<TeamModel> { return mutation.mutateAsync({ path: `/${teamIdSchema.parse(id)}`, method: "PATCH", body: teamUpdateSchema.parse(body) }); }
 /** Soft-delete the confirmed team with snapshot protection. */
 async function remove(id: string, body: TeamDelete): Promise<TeamModel> { return mutation.mutateAsync({ path: `/${teamIdSchema.parse(id)}`, method: "DELETE", body: teamDeleteSchema.parse(body) }); }
 const teams: ComputedRef<TeamModel[]> = computed((): TeamModel[] => query.data.value ?? []);
 const realtime: ReturnType<typeof UseSupabaseRealtimeAllTables> = UseSupabaseRealtimeAllTables();
 /** Refresh caches after any team event from another session. */
 function invalidate(event: { table: string }): void { if (event.table === "teams") void reload(); }
 realtime.events.on("INSERT", invalidate); realtime.events.on("UPDATE", invalidate); realtime.events.on("DELETE", invalidate);
 onScopeDispose((): void => { realtime.events.off("INSERT", invalidate); realtime.events.off("UPDATE", invalidate); realtime.events.off("DELETE", invalidate); });
 return { teams, isPending: query.isPending, isError: query.isError, isSaving: mutation.isPending, create, save, remove };
}
