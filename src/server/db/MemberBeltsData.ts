import type { EventHandlerRequest, H3Event } from "h3";
import {
	type BeltRecord,
	beltFromRecord,
} from "#shared/types/models/BeltModel";
import type {
	MemberBeltModel,
	MemberBeltWithBeltDetailModel,
} from "#shared/types/models/MemberBeltModel";
import {
	memberBeltFromRecord,
	memberBeltFromRecords,
	memberBeltToRecords,
} from "#shared/types/models/MemberBeltModel";
import { ErrorToString } from "#shared/utils/ErrorHelpers";
import type { Database } from "../../types/supabase";
import { GetSupabaseAdminClient } from "./DatabaseClient";

export type MemberBeltRecord =
	Database["coderdojo"]["Tables"]["member_belts"]["Row"];

/**
 * Data access methods for member belts, which represent the belts that members have been awarded or have applied for. This includes methods to get all belts, get pending applications, get belts by member ID, save changes to belts, and delete belts.
 */
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
			if (error || !data) {
				console.error("Error 1 fetching member belts:", error);
				return [];
			}
			return memberBeltFromRecords(data as unknown as MemberBeltRecord[]);
		} catch (error) {
			throw new Error(`Error 2 fetching member belts: ${ErrorToString(error)}`);
		}
	},

	/**
	 * Get pending belt applications, which are member belt records that have an application date but no awarded or rejected date. These are the applications that mentors need to review and either award or reject.
	 */
	GetPendingMemberBeltApplications: async (
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
				.select("*")
				.not("application_date", "is", null)
				.is("awarded", null)
				.is("rejected_date", null);
			if (error || !data) {
				console.error("Error 1 fetching pending member belts:", error);
				return [];
			}
			return memberBeltFromRecords(data as unknown as MemberBeltRecord[]);
		} catch (error) {
			throw new Error(
				`Error 2 fetching pending member belts: ${ErrorToString(error)}`,
			);
		}
	},

	/**
	 * Get the latest awarded belt per member.
	 */
	GetLatestMemberBelts: async (
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
				.select("*")
				.not("awarded", "is", null);
			if (error || !data) {
				if (error) {
					console.error("Error 1 fetching latest member belts:", error);
				}
				return [];
			}

			const belts: MemberBeltModel[] = memberBeltFromRecords(
				data as unknown as MemberBeltRecord[],
			);
			const latestByMemberId: Record<string, MemberBeltModel> = {};
			for (const belt of belts) {
				const current: MemberBeltModel | undefined =
					latestByMemberId[belt.memberId];
				const currentAwarded: number = current?.awarded ?? 0;
				const beltAwarded: number = belt.awarded ?? 0;
				if (!current || beltAwarded > currentAwarded) {
					latestByMemberId[belt.memberId] = belt;
				}
			}

			const latestBelts: MemberBeltModel[] = Object.values(latestByMemberId);
			latestBelts.sort((a, b) => {
				const aAwarded: number = a.awarded ?? 0;
				const bAwarded: number = b.awarded ?? 0;
				return bAwarded - aAwarded;
			});

			return latestBelts;
		} catch (error) {
			throw new Error(
				`Error 2 fetching latest member belts: ${ErrorToString(error)}`,
			);
		}
	},

	/**
	 * Get the member belts for a specific member, including belt details. This is used to display a member's belt history on their profile page.
	 */
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
			if (error || !data) {
				if (error) {
					console.error("Error 1 fetching member belts by member ID:", error);
				}
				return [];
			}
			const rows: JoinedRow[] = data as unknown as JoinedRow[];
			rows.sort((a, b) => {
				const aAwarded: string = a.awarded ?? "";
				const bAwarded: string = b.awarded ?? "";
				return aAwarded.localeCompare(bAwarded);
			});
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

	/**
	 * Save changes to a member belt application or award. If the entity has an id that matches an existing record, it will be updated. Otherwise, a new record will be inserted.
	 */
	SaveMemberBelt: async (
		event: H3Event<EventHandlerRequest>,
		entity: MemberBeltModel,
	): Promise<MemberBeltModel | null> => {
		const all = await MemberBeltsData.SaveMemberBelts(event, [entity]);
		return all[0] || null;
	},

	/**
	 * Save an array of member belt applications or awards. For each entity, if it has an id that matches an existing record, it will be updated. Otherwise, a new record will be inserted.
	 */
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
			if (error || !data) {
				console.error("Error saving member belts:", error);
				return [];
			}
			return memberBeltFromRecords(data as unknown as MemberBeltRecord[]);
		} catch (error) {
			throw new Error(`Error saving member belts: ${ErrorToString(error)}`);
		}
	},

	/**
	 * Delete a member belt record by id.
	 */
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
