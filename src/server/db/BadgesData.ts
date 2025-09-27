import type { H3Event, EventHandlerRequest } from "h3";
import { GetSupabaseAdminClient } from "./DatabaseClient";
import type { Database } from "../../types/supabase";
import { badgeFromRecords, badgeToRecords, type BadgeModel } from "~~/shared/types/models/BadgeModel";

export type BadgeRecord = Database["coderdojo"]["Tables"]["badges"]["Row"];

export const BadgesData = {
	GetBadges: async (
		event: H3Event<EventHandlerRequest>,
		includeDeleted: boolean,
	): Promise<BadgeModel[]> => {
		const supabase = await GetSupabaseAdminClient(event);
		if (!supabase) return [];
		try {
			const query = supabase
				.schema("coderdojo")
				.from("badges")
				.select("*")
				.order("achievement", { ascending: true });
			if (!includeDeleted) {
				query.eq("deleted", false);
			}
			const { data, error } = await query;
			if (error || !data || data.length === 0) {
				console.error("Error fetching badges:", error);
				return [];
			}
			return badgeFromRecords(data as any);
		} catch (error: any) {
			throw new Error(`Error fetching badges: ${error?.message}`);
		}
	},
	SaveBadge: async (
		event: H3Event<EventHandlerRequest>,
		badge: BadgeModel
	): Promise<BadgeModel | null> => {
		const all = await BadgesData.SaveBadges(event, [badge]);
		return all[0] || null;
	},
	SaveBadges: async (
		event: H3Event<EventHandlerRequest>,
		badges: BadgeModel[]
	): Promise<BadgeModel[]> => {
		const supabase = await GetSupabaseAdminClient(event);
		if (!supabase) return [];
		try {
			const { data, error } = await supabase.schema("coderdojo").from("badges").upsert(badgeToRecords(badges) as any, { onConflict: "id" }).select();
			if (error || !data || data.length === 0) {
				console.error("Error saving badges:", error);
				return [];
			}
			return badgeFromRecords(data as any);
		} catch (error: any) {
			throw new Error(`Error saving badges: ${error?.message}`);
		}
	},
	DeleteBadge: async (
		event: H3Event<EventHandlerRequest>,
		badgeId: string
	): Promise<boolean> => {
		const supabase = await GetSupabaseAdminClient(event);
		if (!supabase) return false;
		try {
			const { error } = await supabase.schema("coderdojo").from("badges").delete().eq("id", badgeId);
			if (error) {
				console.error("Error deleting badge:", error);
				return false;
			}
			return true;
		} catch (error: any) {
			console.error(`Error deleting badge: ${error?.message}`);
			return false;
		}
	},
};
