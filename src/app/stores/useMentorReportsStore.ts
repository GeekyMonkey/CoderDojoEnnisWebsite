import { useQuery, type QueryFunctionContext } from "@tanstack/vue-query";
import { computed, onScopeDispose, toValue, type ComputedRef, type MaybeRefOrGetter } from "vue";
import { ReportRowSchema, type ReportKind, type ReportRow } from "#shared/types/MentorReport";
import { reportCsv } from "#shared/utils/ReportCsv";
import { UseSupabaseRealtimeAllTables } from "~/composables/UseSupabaseRealtimeAllTables";

/** Own authenticated report fetching, downloads and realtime refresh. */
export function useMentorReportsStore(kind: ReportKind, since: MaybeRefOrGetter<string>) {
 const user: ReturnType<typeof useSupabaseUser> = useSupabaseUser();
 const client: ReturnType<typeof useSupabaseClient> = useSupabaseClient();
 const date: ComputedRef<string> = computed((): string => kind === "belts" ? toValue(since) : "");
 const query: ReturnType<typeof useQuery<ReportRow[]>> = useQuery<ReportRow[]>({
  queryKey: computed((): readonly unknown[] => ["mentorReports", user.value?.sub ?? "", kind, date.value]),
  enabled: computed((): boolean => Boolean(user.value) && (kind !== "belts" || /^\d{4}-\d{2}-\d{2}$/.test(date.value))),
  queryFn: async ({ signal }: QueryFunctionContext): Promise<ReportRow[]> => {
   const { data, error } = await client.auth.getSession();
   if (error || !data.session) throw new Error("Authentication required");
   return ReportRowSchema.array().parse(await $fetch("/api/Management/reports", { signal, headers: { Authorization: `Bearer ${data.session.access_token}` }, query: kind === "belts" ? { kind, since: date.value } : { kind } }));
  }, staleTime: 30_000, retry: false,
 });
 /** Fetch a fresh complete report before saving the CSV. */
 async function download(): Promise<void> {
  const result: Awaited<ReturnType<typeof query.refetch>> = await query.refetch();
  if (result.error || !result.data) throw result.error ?? new Error("Unable to load report");
  const url: string = URL.createObjectURL(new Blob([reportCsv(kind, result.data)], { type: "text/csv;charset=utf-8" }));
  const anchor: HTMLAnchorElement = document.createElement("a");
  anchor.href = url;
  anchor.download = kind === "belts" ? "RecentBelts.csv" : kind === "parents" ? "ParentEmails.csv" : "MentorEmails.csv";
  anchor.click();
  setTimeout((): void => URL.revokeObjectURL(url), 1000);
 }
 const realtime: ReturnType<typeof UseSupabaseRealtimeAllTables> = UseSupabaseRealtimeAllTables();
 /** Refresh reports after remote member, belt or award changes. */
 function invalidate(event: { table: string }): void {
  if (["members", "belts", "member_belts"].includes(event.table)) void query.refetch();
 }
 realtime.events.on("INSERT", invalidate); realtime.events.on("UPDATE", invalidate); realtime.events.on("DELETE", invalidate);
 onScopeDispose((): void => { realtime.events.off("INSERT", invalidate); realtime.events.off("UPDATE", invalidate); realtime.events.off("DELETE", invalidate); });
 return { ...query, download };
}
