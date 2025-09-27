import type { H3Event, EventHandlerRequest } from "h3";
import { GetSupabaseAdminClient } from "./DatabaseClient";
import type { Database } from "../../types/supabase";
import { memberBeltFromRecords, memberBeltToRecords, type MemberBeltModel } from "~~/shared/types/models/MemberBeltModel";

export type MemberBeltRecord = Database["coderdojo"]["Tables"]["member_belts"]["Row"];

export const MemberBeltsData = {
	GetMemberBelts: async (
		event: H3Event<EventHandlerRequest>,
	): Promise<MemberBeltModel[]> => {
		const supabase = await GetSupabaseAdminClient(event);
		if (!supabase) return [];
		try {
			const { data, error } = await supabase.schema("coderdojo").from("member_belts").select("*");
			if (error || !data || data.length === 0) {
				console.error("Error fetching member belts:", error);
				return [];
			}
			return memberBeltFromRecords(data as any);
		} catch (error: any) {
			throw new Error(`Error fetching member belts: ${error?.message}`);
		}
	},
	SaveMemberBelt: async (
		event: H3Event<EventHandlerRequest>,
		entity: MemberBeltModel
	): Promise<MemberBeltModel | null> => {
		const all = await MemberBeltsData.SaveMemberBelts(event, [entity]);
		return all[0] || null;
	},
	SaveMemberBelts: async (
		event: H3Event<EventHandlerRequest>,
		entities: MemberBeltModel[]
	): Promise<MemberBeltModel[]> => {
		const supabase = await GetSupabaseAdminClient(event);
		if (!supabase) return [];
		try {
			const { data, error } = await supabase.schema("coderdojo").from("member_belts").upsert(memberBeltToRecords(entities) as any, { onConflict: "id" }).select();
			if (error || !data || data.length === 0) {
				console.error("Error saving member belts:", error);
				return [];
			}
			return memberBeltFromRecords(data as any);
		} catch (error: any) {
			throw new Error(`Error saving member belts: ${error?.message}`);
		}
	},
	DeleteMemberBelt: async (
		event: H3Event<EventHandlerRequest>,
		id: string
	): Promise<boolean> => {
		const supabase = await GetSupabaseAdminClient(event);
		if (!supabase) return false;
		try {
			const { error } = await supabase.schema("coderdojo").from("member_belts").delete().eq("id", id);
			if (error) {
				console.error("Error deleting member belt:", error);
				return false;
			}
			return true;
		} catch (error: any) {
			console.error(`Error deleting member belt: ${error?.message}`);
			return false;
		}
	},
};
