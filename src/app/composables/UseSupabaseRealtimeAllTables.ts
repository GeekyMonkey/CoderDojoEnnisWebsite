import type { RealtimeChannel } from "@supabase/supabase-js";
import mitt, { type Emitter } from "mitt";
import { UseSupabaseClient } from "./UseSupabaseClient";

export type AllTablesDbEvents = {
	INSERT: { table: string; id: string; newData: unknown };
	UPDATE: { table: string; id: string; newData: unknown; oldData: unknown };
	DELETE: { table: string; id: string };
};

let allTablesChannel: RealtimeChannel | null = null;
let allTablesEmitter: Emitter<AllTablesDbEvents> | null = null;

/**
 * Subscribe once to ALL tables in the `coderdojo` schema. Requires the Supabase
 * Realtime publication to include the desired tables (see SQL note below).
 */
export function UseSupabaseRealtimeAllTables() {
	const { supabaseClient } = UseSupabaseClient();
	if (allTablesChannel && allTablesEmitter) {
		return { channel: allTablesChannel, events: allTablesEmitter };
	}

	console.log(
		"[UseSupabaseClient] Subscribing to changes in ALL coderdojo tables",
	);
	allTablesEmitter = mitt<AllTablesDbEvents>();

	// Wildcard subscription: omit `table` to receive events for every table in the schema
	allTablesChannel = supabaseClient
		.channel("coderdojo:all")
		.on(
			"postgres_changes",
			{ event: "*", schema: "coderdojo" },
			(payload: {
				eventType?: string;
				table?: string;
				new?: Record<string, unknown> | null;
				old?: Record<string, unknown> | null;
			}) => {
				const eventType = payload?.eventType || "";
				const table = payload?.table || "";
				const newData = payload?.new || null;
				const oldData = payload?.old || null;
				console.log(`[SupabaseRealtime][AllTables] ${eventType} on ${table}`);
				const rawId = newData?.id ?? oldData?.id;
				if (!rawId || typeof rawId !== "string" || !allTablesEmitter) return;
				const base = { table, id: rawId };
				if (eventType === "INSERT") {
					allTablesEmitter.emit("INSERT", { ...base, newData });
				} else if (eventType === "UPDATE") {
					allTablesEmitter.emit("UPDATE", { ...base, newData, oldData });
				} else if (eventType === "DELETE") {
					allTablesEmitter.emit("DELETE", base);
				}
			},
		)
		.subscribe();

	return { channel: allTablesChannel, events: allTablesEmitter };
}

/**
 * SQL (run once in Supabase) to ensure all coderdojo schema tables are in the realtime publication:
 *   -- Create or extend a publication which Supabase Realtime uses
 *   create publication coderdojo_realtime for all tables in schema coderdojo;
 *   -- OR add specific tables (example):
 *   alter publication supabase_realtime add table coderdojo.teams, coderdojo.members;
 *
 * After adding new tables later, run another ALTER PUBLICATION ... ADD TABLE statement
 * or switch to the `for all tables in schema` form.
 */
