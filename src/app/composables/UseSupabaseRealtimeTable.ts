import type { RealtimeChannel } from "@supabase/supabase-js";
import mitt, { type Emitter } from "mitt";
import { UseSupabaseClient } from "./UseSupabaseClient";
import type { BaseModel } from "~/stores/baseDbTableStore";

// type DbEventTypes = "INSERT" | "UPDATE" | "DELETE";
export type DbEvents = {
	INSERT: { id: string; newData: unknown };
	UPDATE: { id: string; newData: unknown; oldData: unknown };
	DELETE: { id: string; oldData: unknown };
};

// Singleton values
const realtimeChannels: Map<string, RealtimeChannel> = new Map();
const eventEmitters: Map<string, Emitter<DbEvents>> = new Map();

/**
 * Supabase Client Composable
 */
export function UseSupabaseRealtimeTable<T extends BaseModel> ({
	table,
	forceResubscribe = false,
	onInsert,
	onUpdate,
	onDelete,
}: {
	table: string;
	forceResubscribe?: boolean;
	onInsert?: (evt: { id: string; newData: T }) => void;
	onUpdate?: (evt: { id: string; newData: T; oldData: T }) => void;
	onDelete?: (evt: { id: string; oldData: T }) => void;
}) {
	const { supabaseClient } = UseSupabaseClient();
	const log = useLogger(`SupabaseRealtime-${table}`);

	// Do we already have this subscription?
	const existingChannel = realtimeChannels.get(table);
	const existingEmitter = eventEmitters.get(table);

	// use the existing channel if it exists, or force a resubscribe
	if (existingChannel) {
		if (!forceResubscribe) {
			return { channel: existingChannel, emitter: existingEmitter };
		} else {
			// Unsubscribe from existing channel
			existingChannel.unsubscribe();
			realtimeChannels.delete(table);
			eventEmitters.delete(table);
		}
	}

	// Subscribe to changes in the specified table
	log.info(`Subscribing to changes in the ${table} table`);
	const channel = supabaseClient
		.channel(`coderdojo:${table}`)
		.on(
			"postgres_changes",
			{ event: "*", schema: "coderdojo", table },
			(payload) => {
				const { eventType, new: newData, old: oldData } = payload;
				const id = (newData as any)?.id || (oldData as any).id;
				log.info(`${eventType} received in ${table} table id=${id}`, newData);
				let eventData: { id: string; newData?: unknown; oldData?: unknown } = {
					id,
				};
				if (eventType === "INSERT") {
					onInsert?.({ id, newData: newData as T });
					events.emit("INSERT", { ...eventData, newData });
				} else if (eventType === "UPDATE") {
					onUpdate?.({ id, newData: newData as T, oldData: oldData as T });
					events.emit("UPDATE", { ...eventData, newData, oldData });
				} else if (eventType === "DELETE") {
					onDelete?.({ id, oldData: oldData as T });
					events.emit("DELETE", { ...eventData, oldData });
				}
			},
		)
		.subscribe();
	realtimeChannels.set(table, channel);

	const events = mitt<DbEvents>();
	eventEmitters.set(table, events);

	return {
		channel,
		events,
	};
};

/**
 * Example payload
 */
/*
{
	"schema": "coderdojo",
	"table": "teams",
	"commit_timestamp": "2024-12-11T17:11:47.900Z",
	"eventType": "UPDATE",
	"new": {
		"deleted": false,
		"goal": "Follow our Godot learning path at https://github.com/CoderDojo-Ennis/ScratchyGodot/wiki",
		"hexcode": "#478bbe",
		"id": "1e41b999-6ec1-4d56-972f-46fc91982c2c",
		"notes": null,
		"team_name": "Godot 5"
	},
	"old": {
		"deleted": false,
		"goal": "Follow our Godot learning path at https://github.com/CoderDojo-Ennis/ScratchyGodot/wiki",
		"hexcode": "#478bbe",
		"id": "1e41b999-6ec1-4d56-972f-46fc91982c2c",
		"notes": null,
		"team_name": "Godot 4"
	},
	"errors": null
}
*/
