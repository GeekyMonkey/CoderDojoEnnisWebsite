import type { RealtimeChannel } from "@supabase/supabase-js";
import { useQueryClient } from "@tanstack/vue-query";
import mitt, { type Emitter } from "mitt";
import { DATA_TABLES, realtimeInvalidationSchema, type TableInvalidation } from "#shared/types/RealtimeInvalidation";
import type { MemberIdentity } from "#shared/types/MemberIdentity";
import { useAuthStore } from "~/stores/useAuthStore";
import { UseSupabaseClient } from "./UseSupabaseClient";

export type AllTablesDbEvents = { INSERT: TableInvalidation; UPDATE: TableInvalidation; DELETE: TableInvalidation };
type Subscription = { channel: RealtimeChannel | null; events: Emitter<AllTablesDbEvents> };
const subscriptions: WeakMap<object, Subscription> = new WeakMap<object, Subscription>();

/** Share private, row-free invalidations within this Nuxt app and refetch with current authority. */
export function UseSupabaseRealtimeAllTables(): Subscription {
 const app: ReturnType<typeof useNuxtApp> = useNuxtApp();
 const existing: Subscription | undefined = subscriptions.get(app);
 if (existing) return existing;
 const state: Subscription = { channel: null, events: mitt<AllTablesDbEvents>() };
 subscriptions.set(app, state);
 if (!import.meta.client) return state;
 const { supabaseClient } = UseSupabaseClient();
 const auth: ReturnType<typeof useAuthStore> = useAuthStore();
 const cache: ReturnType<typeof useQueryClient> = useQueryClient();
 let identity: MemberIdentity | null = null;
 let generation: number = 0;
 let disposed: boolean = false;

 /** Notify mounted observers that private data is gone before removing cached queries. */
 function clearPrivateData(): void {
  for (const query of cache.getQueryCache().getAll()) query.setState({ data: undefined, error: null, status: "pending", dataUpdatedAt: 0, fetchStatus: "idle" });
  cache.clear();
 }

 /** Refresh projections after reconnect or missed invalidations without retaining row snapshots. */
 function invalidateAll(): void {
  for (const table of DATA_TABLES) state.events.emit("UPDATE", { table });
 }

 /** Renew server authorization and reconnect the channel without trusting user metadata. */
 async function renew(): Promise<void> {
  const current: number = ++generation;
  const previous: RealtimeChannel | null = state.channel;
  state.channel = null;
  if (previous) await supabaseClient.removeChannel(previous);
  try {
   const next: MemberIdentity = await auth.getIdentity();
   if (disposed || current !== generation) return;
   if (identity && JSON.stringify(identity) !== JSON.stringify(next)) clearPrivateData();
   identity = next;
   const { data } = await supabaseClient.auth.getSession();
   if (!data.session || disposed || current !== generation) return;
   await supabaseClient.realtime.setAuth(data.session.access_token);
   if (disposed || current !== generation) return;
   const channel: RealtimeChannel = supabaseClient.channel(`coderdojo:member:${next.id}`, { config: { private: true } });
   state.channel = channel.on("broadcast", { event: "invalidate" }, (message: { payload: unknown }): void => {
    const parsed: ReturnType<typeof realtimeInvalidationSchema.safeParse> = realtimeInvalidationSchema.safeParse(message.payload);
    if (parsed.success && current === generation) state.events.emit(parsed.data.operation, { table: parsed.data.table });
   }).subscribe((status: string): void => {
    if (status === "SUBSCRIBED" && current === generation) invalidateAll();
   });
  } catch (error: unknown) {
   if (disposed || current !== generation) return;
   const status: number | undefined = (error as { statusCode?: number; status?: number }).statusCode ?? (error as { status?: number }).status;
   if (status === 401 || status === 403) { identity = null; clearPrivateData(); }
   // No broad service/read or raw Postgres Changes fallback on failure.
  }
 }

 const listener: ReturnType<typeof supabaseClient.auth.onAuthStateChange> = supabaseClient.auth.onAuthStateChange((event: string): void => {
  if (event === "SIGNED_OUT" || event === "SIGNED_IN") { identity = null; clearPrivateData(); }
  // Avoid awaiting Supabase auth calls within its locked auth callback.
  void Promise.resolve().then(renew);
 });
 const timer: ReturnType<typeof setInterval> = setInterval((): void => { void renew(); }, 60_000);
 // Remove cached projections when any guarded refetch observes revoked authority.
 const stopCache: () => void = cache.getQueryCache().subscribe((event): void => {
  if (event.type !== "updated" || event.action.type !== "error") return;
  const error: unknown = event.query.state.error;
  const status: number | undefined = (error as { statusCode?: number } | null)?.statusCode ?? (error as { status?: number } | null)?.status;
  if (status === 401 || status === 403) { identity = null; clearPrivateData(); }
 });
 app.vueApp.onUnmount((): void => {
  disposed = true; generation++; clearInterval(timer); listener.data.subscription.unsubscribe(); stopCache();
  if (state.channel) void supabaseClient.removeChannel(state.channel);
  subscriptions.delete(app);
 });
 void renew();
 return state;
}
