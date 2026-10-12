import { useMutation, useQuery, useQueryClient, type QueryFunctionContext } from "@tanstack/vue-query";
import { computed, onScopeDispose, type ComputedRef, type Ref } from "vue";
import { dataMaintenanceReportSchema, dataMaintenanceRequestSchema, type DataMaintenanceAction, type DataMaintenanceRequest, type DataMaintenanceReport } from "#shared/types/DataMaintenance";
import { useProfileAuthorization } from "~/composables/useProfileAuthorization";
import { UseSupabaseRealtimeAllTables } from "~/composables/UseSupabaseRealtimeAllTables";

type DataMaintenanceStore = {
 data: ComputedRef<DataMaintenanceReport | null>; isPending: Ref<boolean>; isError: Ref<boolean>; isSaving: Ref<boolean>;
 refresh: () => Promise<void>; apply: (report: DataMaintenanceReport) => Promise<DataMaintenanceReport>;
};

/** Own maintenance previews, guarded mutations and refreshes after remote account changes. */
export function useDataMaintenanceStore(action: DataMaintenanceAction): DataMaintenanceStore {
 const user: ReturnType<typeof useSupabaseUser> = useSupabaseUser();
 const headers: ReturnType<typeof useProfileAuthorization> = useProfileAuthorization();
 const cache: ReturnType<typeof useQueryClient> = useQueryClient();
 const query: ReturnType<typeof useQuery<DataMaintenanceReport>> = useQuery<DataMaintenanceReport>({
  queryKey: computed((): readonly unknown[] => ["dataMaintenance", user.value?.email ?? "", action]),
  enabled: computed((): boolean => Boolean(user.value)), retry: false, refetchInterval: 30_000,
  queryFn: async ({ signal }: QueryFunctionContext): Promise<DataMaintenanceReport> => dataMaintenanceReportSchema.parse(await $fetch(`/api/Management/data-maintenance/${action}`, { headers: await headers(), signal })),
 });
 /** Refresh all cached account views after cleanup or registration reset. */
 async function invalidate(): Promise<void> { await cache.invalidateQueries(); }
 const mutation: ReturnType<typeof useMutation<DataMaintenanceReport, Error, DataMaintenanceRequest>> = useMutation<DataMaintenanceReport, Error, DataMaintenanceRequest>({
  mutationFn: async (body: DataMaintenanceRequest): Promise<DataMaintenanceReport> => dataMaintenanceReportSchema.parse(await $fetch("/api/Management/data-maintenance", { method: "POST", headers: await headers(), body: dataMaintenanceRequestSchema.parse(body) })),
  onSettled: invalidate,
 });
 /** Read a fresh preview when the mentor requests another review. */
 async function refresh(): Promise<void> { await query.refetch(); }
 /** Submit the snapshot captured by the confirmation screen. */
 async function apply(report: DataMaintenanceReport): Promise<DataMaintenanceReport> {
  return mutation.mutateAsync({ action, revision: report.revision });
 }
 /** Invalidate previews when attendance, roles, registration or family links change. */
 function remoteChange(event: { table: string }): void {
  if (["members", "member_attendances", "member_parents"].includes(event.table)) void cache.invalidateQueries({ queryKey: ["dataMaintenance"] });
 }
 const realtime: ReturnType<typeof UseSupabaseRealtimeAllTables> = UseSupabaseRealtimeAllTables();
 realtime.events.on("INSERT", remoteChange); realtime.events.on("UPDATE", remoteChange); realtime.events.on("DELETE", remoteChange);
 onScopeDispose((): void => { realtime.events.off("INSERT", remoteChange); realtime.events.off("UPDATE", remoteChange); realtime.events.off("DELETE", remoteChange); });
 return { data: computed((): DataMaintenanceReport | null => query.data.value ?? null), isPending: query.isPending, isError: query.isError, isSaving: mutation.isPending, refresh, apply };
}
