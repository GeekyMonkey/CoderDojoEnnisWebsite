import type { EventHandlerRequest, H3Event } from "h3";
import {
	type BeltRecord,
	beltFromRecord,
} from "~~/shared/types/models/BeltModel";
import type {
	MemberBeltModel,
	MemberBeltWithBeltDetailModel,
} from "~~/shared/types/models/MemberBeltModel";
import {
	memberBeltFromRecord,
	memberBeltFromRecords,
	memberBeltToRecords,
} from "~~/shared/types/models/MemberBeltModel";
import { ErrorToString } from "~~/shared/utils/ErrorHelpers";
import type { Database } from "../../types/supabase";
import { GetSupabaseAdminClient } from "./DatabaseClient";

export type MemberBeltRecord =
	Database["coderdojo"]["Tables"]["member_belts"]["Row"];

export const MemberBeltsData = {
	GetMemberBelts: async (
		event: H3Event<EventHandlerRequest>,
	): Promise<MemberBeltModel[]> => {
		const supabase = await GetSupabaseAdminClient(event);
		if (!supabase) {
			return [];
		}
		try {
			const { data, error } = await supabase
				.schema("coderdojo")
				.from("member_belts")
				.select("*");
			if (error || !data || data.length === 0) {
				console.error("Error fetching member belts:", error);
				return [];
			}
			return memberBeltFromRecords(data as unknown as MemberBeltRecord[]);
		} catch (error) {
			throw new Error(`Error fetching member belts: ${ErrorToString(error)}`);
		}
	},

	SaveMemberBelt: async (
		event: H3Event<EventHandlerRequest>,
		entity: MemberBeltModel,
	): Promise<MemberBeltModel | null> => {
		const all = await MemberBeltsData.SaveMemberBelts(event, [entity]);
		return all[0] || null;
	},

	SaveMemberBelts: async (
		event: H3Event<EventHandlerRequest>,
		entities: MemberBeltModel[],
	): Promise<MemberBeltModel[]> => {
		const supabase = await GetSupabaseAdminClient(event);
		if (!supabase) {
			return [];
		}
		try {
			const upsertRecords = memberBeltToRecords(
				entities,
			) as unknown as MemberBeltRecord[];
			const { data, error } = await supabase
				.schema("coderdojo")
				.from("member_belts")
				.upsert(upsertRecords, { onConflict: "id" })
				.select();
			if (error || !data || data.length === 0) {
				console.error("Error saving member belts:", error);
				return [];
			}
			return memberBeltFromRecords(data as unknown as MemberBeltRecord[]);
		} catch (error) {
			throw new Error(`Error saving member belts: ${ErrorToString(error)}`);
		}
	},

	DeleteMemberBelt: async (
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
				.from("member_belts")
				.delete()
				.eq("id", id);
			if (error) {
				console.error("Error deleting member belt:", error);
				return false;
			}
			return true;
		} catch (error) {
			console.error(`Error deleting member belt: ${ErrorToString(error)}`);
			return false;
		}
	},
};
