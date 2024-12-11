import { RealtimeChannel } from "@supabase/supabase-js";
import { UseSupabaseClient } from "./UseSupabaseClient";
import mitt, { type Emitter } from "mitt";

type DbEventTypes = "INSERT" | "UPDATE" | "DELETE";
export type DbEvents = {
	INSERT: { id: string; newData: any };
	UPDATE: { id: string; newData: any; oldData: any };
	DELETE: { id: string };
};

// Singleton values
let realtimeChannels: Map<string, RealtimeChannel> = new Map();
let eventEmitters: Map<string, Emitter<DbEvents>> = new Map();

/**
 * Supabase Client Composable
 */
export const UseSupabaseRealtimeTable = ({
	table,
	forceResubscribe = false,
}: {
	table: string;
	forceResubscribe?: boolean;
}) => {
	const { supabaseClient } = UseSupabaseClient();

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
	console.log(
		`[UseSupabaseClient] Subscribing to changes in the ${table} table`,
	);
	const channel = supabaseClient
		.channel(`coderdojo:${table}`)
		.on(
			"postgres_changes",
			{ event: "*", schema: "coderdojo", table },
			(payload) => {
				const { eventType, new: newData, old: oldData } = payload;
				const id = (newData as any)?.id || (oldData as any).id;
				console.log(
					`[SupabaseRealtime] ${eventType} received in ${table} table id=${id}`,
					newData,
				);
				let eventData: { id: string; newData?: any; oldData?: any } = {
					id,
				};
				if (eventType === "INSERT") {
					eventData.newData = newData;
				} else if (eventType === "UPDATE") {
					eventData = { ...eventData, newData, oldData };
				}
				events.emit(eventType, eventData);
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
