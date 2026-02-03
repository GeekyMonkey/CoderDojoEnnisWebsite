import type { EventHandlerRequest, H3Event } from "h3";
import {
	type BeltModel,
	beltFromRecords,
	beltToRecords,
} from "#shared/types/models/BeltModel";
import { ErrorToString } from "#shared/utils/ErrorHelpers";
import type { Database } from "../../types/supabase";
import { GetSupabaseAdminClient } from "./DatabaseClient";

export type BeltRecord = Database["coderdojo"]["Tables"]["belts"]["Row"];

export const BeltsData = {
	GetBelts: async (
		event: H3Event<EventHandlerRequest>,
		includeDeleted: boolean,
	): Promise<BeltModel[]> => {
		const supabase = await GetSupabaseAdminClient(event);
		if (!supabase) {
			return [];
		}
		try {
			const query = supabase
				.schema("coderdojo")
				.from("belts")
				.select("*")
				.order("sort_order", { ascending: true })
				.order("color", { ascending: true });
			if (!includeDeleted) {
				query.eq("deleted", false);
			}
			const { data, error } = await query;
			if (error || !data || data.length === 0) {
				console.error("Error fetching belts:", error);
				return [];
			}
			return beltFromRecords(data as any);
		} catch (error) {
			throw new Error(`Error fetching belts: ${ErrorToString(error)}`);
		}
	},
	SaveBelt: async (
		event: H3Event<EventHandlerRequest>,
		belt: BeltModel,
	): Promise<BeltModel | null> => {
		const all = await BeltsData.SaveBelts(event, [belt]);
		return all[0] || null;
	},
	SaveBelts: async (
		event: H3Event<EventHandlerRequest>,
		belts: BeltModel[],
	): Promise<BeltModel[]> => {
		const supabase = await GetSupabaseAdminClient(event);
		if (!supabase) {
			return [];
		}
		try {
			const { data, error } = await supabase
				.schema("coderdojo")
				.from("belts")
				.upsert(beltToRecords(belts) as any, { onConflict: "id" })
				.select();
			if (error || !data || data.length === 0) {
				console.error("Error saving belts:", error);
				return [];
			}
			return beltFromRecords(data as any);
		} catch (error) {
			throw new Error(`Error saving belts: ${ErrorToString(error)}`);
		}
	},
	DeleteBelt: async (
		event: H3Event<EventHandlerRequest>,
		beltId: string,
	): Promise<boolean> => {
		const supabase = await GetSupabaseAdminClient(event);
		if (!supabase) {
			return false;
		}
		try {
			const { error } = await supabase
				.schema("coderdojo")
				.from("belts")
				.delete()
				.eq("id", beltId);
			if (error) {
				console.error("Error deleting belt:", error);
				return false;
			}
			return true;
		} catch (error) {
			console.error(`Error deleting belt: ${ErrorToString(error)}`);
			return false;
		}
	},
};
