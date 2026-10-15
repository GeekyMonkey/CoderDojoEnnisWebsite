import type { EventHandlerRequest, H3Event } from "h3";
import {
	type VexSprintModel,
	type VexSprintSaveModel,
	vexSprintFromRecord,
	vexSprintFromRecords,
} from "#shared/types/models/VexSprintModel";
import { ErrorToString } from "#shared/utils/ErrorHelpers";
import type { Database } from "../../types/supabase";
import { GetSupabaseAdminClient } from "./DatabaseClient";

/**
 * Custom types for Supabase schema
 */
export type VexSprintRecord =
	Database["coderdojo"]["Tables"]["vex_sprints"]["Row"];
type VexSprintInsert = Database["coderdojo"]["Tables"]["vex_sprints"]["Insert"];

/**
 * Data for VEX weekly sprints
 */
export const VexSprintsData = {
	/**
	 * Get all sprints (all seasons), ordered by season then sprint number
	 */
	GetSprints: async (
		event: H3Event<EventHandlerRequest>,
	): Promise<VexSprintModel[]> => {
		const supabase = await GetSupabaseAdminClient(event);
		if (!supabase) {
			throw new Error("Database unavailable");
		}
		const { data, error } = await supabase
			.schema("coderdojo")
			.from("vex_sprints")
			.select("*")
			.eq("deleted", false)
			.order("season_id", { ascending: true })
			.order("sprint_number", { ascending: true });
		if (error) {
			throw new Error(`Error fetching VEX sprints: ${ErrorToString(error)}`);
		}
		return vexSprintFromRecords((data ?? []) as VexSprintRecord[]);
	},

	/**
	 * Get one sprint by id
	 */
	GetSprintById: async (
		event: H3Event<EventHandlerRequest>,
		sprintId: string,
	): Promise<VexSprintModel | null> => {
		const supabase = await GetSupabaseAdminClient(event);
		if (!supabase) {
			throw new Error("Database unavailable");
		}
		const { data, error } = await supabase
			.schema("coderdojo")
			.from("vex_sprints")
			.select("*")
			.eq("id", sprintId)
			.eq("deleted", false)
			.maybeSingle();
		if (error) {
			throw new Error(`Error fetching VEX sprint: ${ErrorToString(error)}`);
		}
		return data ? vexSprintFromRecord(data as VexSprintRecord) : null;
	},

	/**
	 * Insert or update a sprint. Making a sprint current completes the season's other current sprint.
	 */
	SaveSprint: async (
		event: H3Event<EventHandlerRequest>,
		sprint: VexSprintSaveModel,
		mentorMemberId: string,
	): Promise<VexSprintModel> => {
		const supabase = await GetSupabaseAdminClient(event);
		if (!supabase) {
			throw new Error("Database unavailable");
		}

		if (sprint.status === "current") {
			const complete = supabase
				.schema("coderdojo")
				.from("vex_sprints")
				.update({ status: "complete" })
				.eq("season_id", sprint.seasonId)
				.eq("status", "current");
			if (sprint.id) {
				complete.neq("id", sprint.id);
			}
			const { error: completeError } = await complete;
			if (completeError) {
				throw new Error(
					`Error completing previous sprint: ${ErrorToString(completeError)}`,
				);
			}
		}

		const record: VexSprintInsert = {
			season_id: sprint.seasonId,
			sprint_number: sprint.sprintNumber,
			title: sprint.title || null,
			objective: sprint.objective || null,
			mentor_notes: sprint.mentorNotes || null,
			start_date: sprint.startDate,
			review_date: sprint.reviewDate,
			status: sprint.status,
		};
		if (sprint.id) {
			record.id = sprint.id;
		} else {
			record.created_by_member_id = mentorMemberId;
		}

		const { data, error } = await supabase
			.schema("coderdojo")
			.from("vex_sprints")
			.upsert(record, { onConflict: "id" })
			.select()
			.single();
		if (error || !data) {
			throw new Error(`Error saving VEX sprint: ${ErrorToString(error)}`);
		}
		return vexSprintFromRecord(data as VexSprintRecord);
	},
};
