import type { EventHandlerRequest, H3Event } from "h3";
import {
	type MemberBadgeCategoryModel,
	memberBadgeCategoryFromRecords,
	memberBadgeCategoryToRecords,
} from "~~/shared/types/models/MemberBadgeCategoryModel";
import { ErrorToString } from "~~/shared/utils/ErrorHelpers";
import type { Database } from "../../types/supabase";
import { GetSupabaseAdminClient } from "./DatabaseClient";

export type MemberBadgeCategoryRecord =
	Database["coderdojo"]["Tables"]["member_badge_categories"]["Row"];

export const MemberBadgeCategoriesData = {
	GetMemberBadgeCategories: async (
		event: H3Event<EventHandlerRequest>,
	): Promise<MemberBadgeCategoryModel[]> => {
		const supabase = await GetSupabaseAdminClient(event);
		if (!supabase) {
			return [];
		}
		try {
			const { data, error } = await supabase
				.schema("coderdojo")
				.from("member_badge_categories")
				.select("*");
			if (error || !data || data.length === 0) {
				console.error("Error fetching member badge categories:", error);
				return [];
			}
			return memberBadgeCategoryFromRecords(data as any);
		} catch (error) {
			throw new Error(
				`Error fetching member badge categories: ${ErrorToString(error)}`,
			);
		}
	},

	SaveMemberBadgeCategory: async (
		event: H3Event<EventHandlerRequest>,
		entity: MemberBadgeCategoryModel,
	): Promise<MemberBadgeCategoryModel | null> => {
		const all = await MemberBadgeCategoriesData.SaveMemberBadgeCategories(
			event,
			[entity],
		);
		return all[0] || null;
	},

	SaveMemberBadgeCategories: async (
		event: H3Event<EventHandlerRequest>,
		entities: MemberBadgeCategoryModel[],
	): Promise<MemberBadgeCategoryModel[]> => {
		const supabase = await GetSupabaseAdminClient(event);
		if (!supabase) {
			return [];
		}
		try {
			const { data, error } = await supabase
				.schema("coderdojo")
				.from("member_badge_categories")
				.upsert(memberBadgeCategoryToRecords(entities) as any, {
					onConflict: "id",
				})
				.select();
			if (error || !data || data.length === 0) {
				console.error("Error saving member badge categories:", error);
				return [];
			}
			return memberBadgeCategoryFromRecords(data as any);
		} catch (error) {
			throw new Error(
				`Error saving member badge categories: ${ErrorToString(error)}`,
			);
		}
	},

	DeleteMemberBadgeCategory: async (
		event: H3Event<EventHandlerRequest>,
		id: string,
	): Promise<boolean> => {
		const supabase = await GetSupabaseAdminClient(event);
		if (!supabase) {
			return false;
		}
		try {
			const { error } = await supabase
				.schema("coderdojo")
				.from("member_badge_categories")
				.delete()
				.eq("id", id);
			if (error) {
				console.error("Error deleting member badge category:", error);
				return false;
			}
			return true;
		} catch (error) {
			console.error(
				`Error deleting member badge category: ${ErrorToString(error)}`,
			);
			return false;
		}
	},
};
