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
				console.error("Error 1 fetching member belts:", error);
				return [];
			}
			return memberBeltFromRecords(data as unknown as MemberBeltRecord[]);
		} catch (error) {
			throw new Error(`Error 2 fetching member belts: ${ErrorToString(error)}`);
		}
	},

	GetMemberBeltsByMemberId: async (
		event: H3Event<EventHandlerRequest>,
		memberId: string,
	): Promise<MemberBeltWithBeltDetailModel[]> => {
		const supabase = await GetSupabaseAdminClient(event);
		if (!supabase) {
			return [];
		}
		try {
			// Perform a server-side join to retrieve belt details in one round-trip.
			// Assuming foreign key member_belts.belt_id -> belts.id and PostgREST relation naming
			// If relation is not automatically recognized, an explicit view or RPC may be required.
			type JoinedRow = MemberBeltRecord & { belt: BeltRecord | null };
			const { data, error } = await supabase
				.schema("coderdojo")
				.from("member_belts")
				.select("*, belt:belts(*)")
				.eq("member_id", memberId);
			if (error || !data || (data as unknown as JoinedRow[]).length === 0) {
				if (error) {
					console.error("Error 1 fetching member belts by member ID:", error);
				}
				return [];
			}
			const rows: JoinedRow[] = data as unknown as JoinedRow[];
			return rows
				.filter((r): r is JoinedRow & { belt: BeltRecord } => !!r.belt)
				.map((r) => ({
					...memberBeltFromRecord(r as MemberBeltRecord),
					belt: beltFromRecord(r.belt as BeltRecord),
				}));
		} catch (error) {
			throw new Error(
				`Error 2 fetching member belts by member ID: ${ErrorToString(error)}`,
			);
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
