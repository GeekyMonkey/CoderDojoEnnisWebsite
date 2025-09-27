import type { H3Event, EventHandlerRequest } from "h3";
import { GetSupabaseAdminClient } from "./DatabaseClient";
import type { Database } from "../../types/supabase";
import { badgeCategoryFromRecords, badgeCategoryToRecords, type BadgeCategoryModel } from "~~/shared/types/models/BadgeCategoryModel";

export type BadgeCategoryRecord = Database["coderdojo"]["Tables"]["badge_categories"]["Row"];

export const BadgeCategoriesData = {
	GetBadgeCategories: async (
		event: H3Event<EventHandlerRequest>,
		includeDeleted: boolean,
	): Promise<BadgeCategoryModel[]> => {
		const supabase = await GetSupabaseAdminClient(event);
		if (!supabase) return [];
		try {
			const query = supabase
				.schema("coderdojo")
				.from("badge_categories")
				.select("*")
				.order("category_name", { ascending: true });
			if (!includeDeleted) {
				query.eq("deleted", false);
			}
			const { data, error } = await query;
			if (error || !data || data.length === 0) {
				console.error("Error fetching badge categories:", error);
				return [];
			}
			return badgeCategoryFromRecords(data as any);
		} catch (error: any) {
			throw new Error(`Error fetching badge categories: ${error?.message}`);
		}
	},

	SaveBadgeCategory: async (
		event: H3Event<EventHandlerRequest>,
		category: BadgeCategoryModel
	): Promise<BadgeCategoryModel | null> => {
		const all = await BadgeCategoriesData.SaveBadgeCategories(event, [category]);
		return all[0] || null;
	},

	SaveBadgeCategories: async (
		event: H3Event<EventHandlerRequest>,
		categories: BadgeCategoryModel[]
	): Promise<BadgeCategoryModel[]> => {
		const supabase = await GetSupabaseAdminClient(event);
		if (!supabase) return [];
		try {
			const { data, error } = await supabase.schema("coderdojo").from("badge_categories").upsert(badgeCategoryToRecords(categories) as any, { onConflict: "id" }).select();
			if (error || !data || data.length === 0) {
				console.error("Error saving badge categories:", error);
				return [];
			}
			return badgeCategoryFromRecords(data as any);
		} catch (error: any) {
			throw new Error(`Error saving badge categories: ${error?.message}`);
		}
	},

	DeleteBadgeCategory: async (
		event: H3Event<EventHandlerRequest>,
		categoryId: string
	): Promise<boolean> => {
		const supabase = await GetSupabaseAdminClient(event);
		if (!supabase) return false;
		try {
			const { error } = await supabase.schema("coderdojo").from("badge_categories").delete().eq("id", categoryId);
			if (error) {
				console.error("Error deleting badge category:", error);
				return false;
			}
			return true;
		} catch (error: any) {
			console.error(`Error deleting badge category: ${error?.message}`);
			return false;
		}
	},
};
