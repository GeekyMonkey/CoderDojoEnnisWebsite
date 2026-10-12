import type { TableInvalidation } from "#shared/types/RealtimeInvalidation";
import { UseSupabaseRealtimeAllTables } from "./UseSupabaseRealtimeAllTables";

/** Listen for one table's safe invalidations through the shared private channel. */
export function UseSupabaseRealtimeTable({ table, onInvalidate }: { table: string; onInvalidate: (event: TableInvalidation) => void }): void {
 const realtime: ReturnType<typeof UseSupabaseRealtimeAllTables> = UseSupabaseRealtimeAllTables();
 /** Filter table invalidations without depending on an exposed record ID. */
 function invalidate(event: TableInvalidation): void { if (event.table === table) onInvalidate(event); }
 for (const operation of ["INSERT", "UPDATE", "DELETE"] as const) realtime.events.on(operation, invalidate);
 onScopeDispose((): void => {
  for (const operation of ["INSERT", "UPDATE", "DELETE"] as const) realtime.events.off(operation, invalidate);
 });
}
