import type { EventHandlerRequest, H3Event } from "h3";
import {
	type VexSeasonModel,
	type VexSeasonSaveModel,
	vexSeasonFromRecord,
	vexSeasonFromRecords,
} from "#shared/types/models/VexSeasonModel";
import { ErrorToString } from "#shared/utils/ErrorHelpers";
import type { Database } from "../../types/supabase";
import { GetSupabaseAdminClient } from "./DatabaseClient";

/**
 * Custom types for Supabase schema
 */
export type VexSeasonRecord =
	Database["coderdojo"]["Tables"]["vex_seasons"]["Row"];
type VexSeasonInsert = Database["coderdojo"]["Tables"]["vex_seasons"]["Insert"];

/**
 * Data for VEX seasons
 */
export const VexSeasonsData = {
	/**
	 * Get all seasons, newest first
	 */
	GetSeasons: async (
		event: H3Event<EventHandlerRequest>,
	): Promise<VexSeasonModel[]> => {
		const supabase = await GetSupabaseAdminClient(event);
		if (!supabase) {
			throw new Error("Database unavailable");
		}
		const { data, error } = await supabase
			.schema("coderdojo")
			.from("vex_seasons")
			.select("*")
			.eq("deleted", false)
			.order("slug", { ascending: false });
		if (error) {
			throw new Error(`Error fetching VEX seasons: ${ErrorToString(error)}`);
		}
		return vexSeasonFromRecords((data ?? []) as VexSeasonRecord[]);
	},

	/**
	 * Insert or update a season. Making a season current clears the flag on the others.
	 */
	SaveSeason: async (
		event: H3Event<EventHandlerRequest>,
		season: VexSeasonSaveModel,
	): Promise<VexSeasonModel> => {
		const supabase = await GetSupabaseAdminClient(event);
		if (!supabase) {
			throw new Error("Database unavailable");
		}

		if (season.isCurrent) {
			const clear = supabase
				.schema("coderdojo")
				.from("vex_seasons")
				.update({ is_current: false })
				.eq("is_current", true);
			if (season.id) {
				clear.neq("id", season.id);
			}
			const { error: clearError } = await clear;
			if (clearError) {
				throw new Error(
					`Error clearing current season: ${ErrorToString(clearError)}`,
				);
			}
		}

		const record: VexSeasonInsert = {
			slug: season.slug,
			season_label: season.seasonLabel,
			program_name: season.programName,
			competition_name: season.competitionName,
			description: season.description,
			is_current: season.isCurrent,
			start_date: season.startDate,
			end_date: season.endDate,
		};
		if (season.id) {
			record.id = season.id;
		}

		const { data, error } = await supabase
			.schema("coderdojo")
			.from("vex_seasons")
			.upsert(record, { onConflict: "id" })
			.select()
			.single();
		if (error || !data) {
			throw new Error(`Error saving VEX season: ${ErrorToString(error)}`);
		}
		return vexSeasonFromRecord(data as VexSeasonRecord);
	},
};
