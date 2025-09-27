import type { H3Event, EventHandlerRequest } from "h3";
import { GetSupabaseAdminClient } from "./DatabaseClient";
import type { Database } from "../../types/supabase";
import { memberParentFromRecords, memberParentToRecords, type MemberParentModel } from "~~/shared/types/models/MemberParentModel";

export type MemberParentRecord = Database["coderdojo"]["Tables"]["member_parents"]["Row"];

export const MemberParentsData = {
	GetMemberParents: async (
		event: H3Event<EventHandlerRequest>,
	): Promise<MemberParentModel[]> => {
		const supabase = await GetSupabaseAdminClient(event);
		if (!supabase) return [];
		try {
			const { data, error } = await supabase.schema("coderdojo").from("member_parents").select("*");
			if (error || !data || data.length === 0) {
				console.error("Error fetching member parents:", error);
				return [];
			}
			return memberParentFromRecords(data as any);
		} catch (error: any) {
			throw new Error(`Error fetching member parents: ${error?.message}`);
		}
	},
	SaveMemberParent: async (
		event: H3Event<EventHandlerRequest>,
		entity: MemberParentModel
	): Promise<MemberParentModel | null> => {
		const all = await MemberParentsData.SaveMemberParents(event, [entity]);
		return all[0] || null;
	},
	SaveMemberParents: async (
		event: H3Event<EventHandlerRequest>,
		entities: MemberParentModel[]
	): Promise<MemberParentModel[]> => {
		const supabase = await GetSupabaseAdminClient(event);
		if (!supabase) return [];
		try {
			const { data, error } = await supabase.schema("coderdojo").from("member_parents").upsert(memberParentToRecords(entities) as any, { onConflict: "id" }).select();
			if (error || !data || data.length === 0) {
				console.error("Error saving member parents:", error);
				return [];
			}
			return memberParentFromRecords(data as any);
		} catch (error: any) {
			throw new Error(`Error saving member parents: ${error?.message}`);
		}
	},
	DeleteMemberParent: async (
		event: H3Event<EventHandlerRequest>,
		id: string
	): Promise<boolean> => {
		const supabase = await GetSupabaseAdminClient(event);
		if (!supabase) return false;
		try {
			const { error } = await supabase.schema("coderdojo").from("member_parents").delete().eq("id", id);
			if (error) {
				console.error("Error deleting member parent:", error);
				return false;
			}
			return true;
		} catch (error: any) {
			console.error(`Error deleting member parent: ${error?.message}`);
			return false;
		}
	},
};
