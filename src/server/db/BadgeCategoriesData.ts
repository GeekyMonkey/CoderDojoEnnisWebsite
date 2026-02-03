import type { EventHandlerRequest, H3Event } from "h3";
import {
	type BadgeCategoryModel,
	badgeCategoryFromRecords,
	badgeCategoryToRecords,
} from "#shared/types/models/BadgeCategoryModel";
import { ErrorToString } from "#shared/utils/ErrorHelpers";
import type { Database } from "../../types/supabase";
import { GetSupabaseAdminClient } from "./DatabaseClient";

export type BadgeCategoryRecord =
	Database["coderdojo"]["Tables"]["badge_categories"]["Row"];

export const BadgeCategoriesData = {
	GetBadgeCategories: async (
		event: H3Event<EventHandlerRequest>,
		includeDeleted: boolean,
	): Promise<BadgeCategoryModel[]> => {
		const supabase = await GetSupabaseAdminClient(event);
		if (!supabase) {
			return [];
		}
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
		} catch (error) {
			throw new Error(
				`Error fetching badge categories: ${ErrorToString(error)}`,
			);
		}
	},

	SaveBadgeCategory: async (
		event: H3Event<EventHandlerRequest>,
		category: BadgeCategoryModel,
	): Promise<BadgeCategoryModel | null> => {
		const all = await BadgeCategoriesData.SaveBadgeCategories(event, [
			category,
		]);
		return all[0] || null;
	},

	SaveBadgeCategories: async (
		event: H3Event<EventHandlerRequest>,
		categories: BadgeCategoryModel[],
	): Promise<BadgeCategoryModel[]> => {
		const supabase = await GetSupabaseAdminClient(event);
		if (!supabase) {
			return [];
		}
		try {
			const { data, error } = await supabase
				.schema("coderdojo")
				.from("badge_categories")
				.upsert(badgeCategoryToRecords(categories) as any, { onConflict: "id" })
				.select();
			if (error || !data || data.length === 0) {
				console.error("Error saving badge categories:", error);
				return [];
			}
			return badgeCategoryFromRecords(data as any);
		} catch (error) {
			throw new Error(`Error saving badge categories: ${ErrorToString(error)}`);
		}
	},

	DeleteBadgeCategory: async (
		event: H3Event<EventHandlerRequest>,
		categoryId: string,
	): Promise<boolean> => {
		const supabase = await GetSupabaseAdminClient(event);
		if (!supabase) {
			return false;
		}
		try {
			const { error } = await supabase
				.schema("coderdojo")
				.from("badge_categories")
				.delete()
				.eq("id", categoryId);
			if (error) {
				console.error("Error deleting badge category:", error);
				return false;
			}
			return true;
		} catch (error) {
			console.error(`Error deleting badge category: ${ErrorToString(error)}`);
			return false;
		}
	},
};
