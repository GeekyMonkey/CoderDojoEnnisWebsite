import type { EventHandlerRequest, H3Event } from "h3";
import {
	type VexResourceModel,
	type VexResourceSaveModel,
	vexResourceFromRecord,
	vexResourceFromRecords,
} from "#shared/types/models/VexResourceModel";
import { ErrorToString } from "#shared/utils/ErrorHelpers";
import type { Database } from "../../types/supabase";
import { GetSupabaseAdminClient } from "./DatabaseClient";

/**
 * Custom types for Supabase schema
 */
export type VexResourceRecord =
	Database["coderdojo"]["Tables"]["vex_resources"]["Row"];
type VexResourceInsert =
	Database["coderdojo"]["Tables"]["vex_resources"]["Insert"];

/**
 * Data for VEX resources
 */
export const VexResourcesData = {
	/**
	 * Get all (non-deleted) resources, including inactive ones
	 */
	GetResources: async (
		event: H3Event<EventHandlerRequest>,
	): Promise<VexResourceModel[]> => {
		const supabase = await GetSupabaseAdminClient(event);
		if (!supabase) {
			throw new Error("Database unavailable");
		}
		const { data, error } = await supabase
			.schema("coderdojo")
			.from("vex_resources")
			.select("*")
			.eq("deleted", false)
			.order("category", { ascending: true })
			.order("sort_order", { ascending: true })
			.order("title", { ascending: true });
		if (error) {
			throw new Error(`Error fetching VEX resources: ${ErrorToString(error)}`);
		}
		return vexResourceFromRecords((data ?? []) as VexResourceRecord[]);
	},

	/**
	 * Insert or update a resource
	 */
	SaveResource: async (
		event: H3Event<EventHandlerRequest>,
		resource: VexResourceSaveModel,
	): Promise<VexResourceModel> => {
		const supabase = await GetSupabaseAdminClient(event);
		if (!supabase) {
			throw new Error("Database unavailable");
		}
		const record: VexResourceInsert = {
			season_id: resource.seasonId,
			category: resource.category,
			title: resource.title,
			description: resource.description || null,
			url: resource.url,
			resource_type: resource.resourceType,
			sort_order: resource.sortOrder,
			is_active: resource.isActive,
		};
		if (resource.id) {
			record.id = resource.id;
		}
		const { data, error } = await supabase
			.schema("coderdojo")
			.from("vex_resources")
			.upsert(record, { onConflict: "id" })
			.select()
			.single();
		if (error || !data) {
			throw new Error(`Error saving VEX resource: ${ErrorToString(error)}`);
		}
		return vexResourceFromRecord(data as VexResourceRecord);
	},

	/**
	 * Soft delete a resource
	 */
	DeleteResource: async (
		event: H3Event<EventHandlerRequest>,
		resourceId: string,
	): Promise<boolean> => {
		const supabase = await GetSupabaseAdminClient(event);
		if (!supabase) {
			throw new Error("Database unavailable");
		}
		const { error } = await supabase
			.schema("coderdojo")
			.from("vex_resources")
			.update({ deleted: true })
			.eq("id", resourceId);
		if (error) {
			throw new Error(`Error deleting VEX resource: ${ErrorToString(error)}`);
		}
		return true;
	},
};
