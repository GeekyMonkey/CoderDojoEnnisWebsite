import type { EventHandlerRequest, H3Event } from "h3";
import {
	type MemberBadgeModel,
	memberBadgeFromRecords,
	memberBadgeToRecords,
} from "~~/shared/types/models/MemberBadgeModel";
import type { Database } from "../../types/supabase";
import { GetSupabaseAdminClient } from "./DatabaseClient";
import { ErrorToString } from "~~/shared/utils/ErrorHelpers";

export type MemberBadgeRecord =
	Database["coderdojo"]["Tables"]["member_badges"]["Row"];

export const MemberBadgesData = {
	GetMemberBadges: async (
		event: H3Event<EventHandlerRequest>,
	): Promise<MemberBadgeModel[]> => {
		const supabase = await GetSupabaseAdminClient(event);
		if (!supabase) return [];
		try {
			const { data, error } = await supabase
				.schema("coderdojo")
				.from("member_badges")
				.select("*");
			if (error || !data || data.length === 0) {
				console.error("Error fetching member badges:", error);
				return [];
			}
			return memberBadgeFromRecords(data as any);
		} catch (error) {
			throw new Error(`Error fetching member badges: ${ErrorToString(error)}`);
		}
	},

	SaveMemberBadge: async (
		event: H3Event<EventHandlerRequest>,
		entity: MemberBadgeModel,
	): Promise<MemberBadgeModel | null> => {
		const all = await MemberBadgesData.SaveMemberBadges(event, [entity]);
		return all[0] || null;
	},

	SaveMemberBadges: async (
		event: H3Event<EventHandlerRequest>,
		entities: MemberBadgeModel[],
	): Promise<MemberBadgeModel[]> => {
		const supabase = await GetSupabaseAdminClient(event);
		if (!supabase) return [];
		try {
			const { data, error } = await supabase
				.schema("coderdojo")
				.from("member_badges")
				.upsert(memberBadgeToRecords(entities) as any, { onConflict: "id" })
				.select();
			if (error || !data || data.length === 0) {
				console.error("Error saving member badges:", error);
				return [];
			}
			return memberBadgeFromRecords(data as any);
		} catch (error) {
			throw new Error(`Error saving member badges: ${ErrorToString(error)}`);
		}
	},

	DeleteMemberBadge: async (
		event: H3Event<EventHandlerRequest>,
		id: string,
	): Promise<boolean> => {
		const supabase = await GetSupabaseAdminClient(event);
		if (!supabase) return false;
		try {
			const { error } = await supabase
				.schema("coderdojo")
				.from("member_badges")
				.delete()
				.eq("id", id);
			if (error) {
				console.error("Error deleting member badge:", error);
				return false;
			}
			return true;
		} catch (error) {
			console.error(`Error deleting member badge: ${ErrorToString(error)}`);
			return false;
		}
	},
};
