import type { H3Event, EventHandlerRequest } from "h3";
import { GetSupabaseAdminClient } from "./DatabaseClient";
import type { Database } from "../../types/supabase";
import {
	sessionFromRecords,
	sessionToRecords,
	type SessionModel,
} from "~~/shared/types/models/SessionModel";
import { ErrorToString } from "~~/shared/utils/ErrorHelpers";

export type SessionRecord = Database["coderdojo"]["Tables"]["sessions"]["Row"];

export const SessionsData = {
	/**
	 * Get all sessions from the sessions table
	 */
	GetSessions: async (
		event: H3Event<EventHandlerRequest>,
	): Promise<SessionModel[]> => {
		const supabase = await GetSupabaseAdminClient(event);
		if (!supabase) return [];
		try {
			const { data, error } = await supabase
				.schema("coderdojo")
				.from("sessions")
				.select("*");
			if (error || !data || data.length === 0) {
				console.error("Error fetching sessions:", error);
				return [];
			}
			return sessionFromRecords(data as any);
		} catch (error) {
			throw new Error(`Error fetching sessions: ${ErrorToString(error)}`);
		}
	},

	/**
	 * Save a session to the sessions table
	 */
	SaveSession: async (
		event: H3Event<EventHandlerRequest>,
		session: SessionModel,
	): Promise<SessionModel | null> => {
		const all = await SessionsData.SaveSessions(event, [session]);
		return all[0] || null;
	},

	/**
	 * Save an array of sessions to the sessions table
	 */
	SaveSessions: async (
		event: H3Event<EventHandlerRequest>,
		sessions: SessionModel[],
	): Promise<SessionModel[]> => {
		const supabase = await GetSupabaseAdminClient(event);
		if (!supabase) return [];
		try {
			const { data, error } = await supabase
				.schema("coderdojo")
				.from("sessions")
				.upsert(sessionToRecords(sessions) as any, { onConflict: "id" })
				.select();
			if (error || !data || data.length === 0) {
				console.error("Error saving sessions:", error);
				return [];
			}
			return sessionFromRecords(data as any);
		} catch (error) {
			throw new Error(`Error saving sessions: ${ErrorToString(error)}`);
		}
	},

	/**
	 * Delete a session by ID
	 */
	DeleteSession: async (
		event: H3Event<EventHandlerRequest>,
		sessionId: string,
	): Promise<boolean> => {
		const supabase = await GetSupabaseAdminClient(event);
		if (!supabase) return false;
		try {
			const { error } = await supabase
				.schema("coderdojo")
				.from("sessions")
				.delete()
				.eq("id", sessionId);
			if (error) {
				console.error("Error deleting session:", error);
				return false;
			}
			return true;
		} catch (error) {
			console.error(`Error deleting session: ${ErrorToString(error)}`);
			return false;
		}
	},
};
