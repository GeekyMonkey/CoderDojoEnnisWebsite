import type { EventHandlerRequest, H3Event } from "h3";
import {
	type TeamModel,
	teamFromRecords,
} from "~~/shared/types/models/TeamModel";
import { ErrorToString } from "~~/shared/utils/ErrorHelpers";
import { useLogger } from "~~/shared/utils/Logger";
import type { Database } from "../../types/supabase";
import { GetSupabaseAdminClient, GetSupabaseClient } from "./DatabaseClient";

/**
 * Custom types for Supabase schema
 */
export type TeamRecord = Database["coderdojo"]["Tables"]["teams"]["Row"];

const log = useLogger("TeamsData");

/**
 * Data for teams
 */
export const TeamsData = {
	/**
	 * Get the team rows (cached)
	 */
	GetTeams: async (
		event: H3Event<EventHandlerRequest>,
		includeDeleted: boolean,
	): Promise<TeamModel[]> => {
		const supabase = await GetSupabaseAdminClient(event);
		if (!supabase) {
			return [];
		}
		try {
			const query = supabase
				.schema("coderdojo")
				.from("teams")
				.select("*")
				.order("team_name", { ascending: true });
			if (!includeDeleted) {
				query.eq("deleted", false);
			}
			const { data: teams, error } = await query;

			if (error || !teams || teams.length === 0) {
				log.error("Error fetching teams:", undefined, { error });
				return [];
			}

			return teamFromRecords(teams as TeamRecord[]);
		} catch (error) {
			throw new Error(`Error fetching teams: ${ErrorToString(error)}`);
		}
	},

	/**
	 * Upsert a team row
	 */
	SaveTeam: async (
		event: H3Event<EventHandlerRequest>,
		team: TeamModel,
	): Promise<TeamModel | null> => {
		const teams = await TeamsData.SaveTeams(event, [team]);
		return teams.length > 0 ? teams[0] : null;
	},

	/**
	 * Upsert multiple team rows
	 */
	SaveTeams: async (
		event: H3Event<EventHandlerRequest>,
		teams: TeamModel[],
	): Promise<TeamModel[]> => {
		const supabase = await GetSupabaseAdminClient(event);
		if (!supabase) {
			return [];
		}
		try {
			const teamRecords: TeamRecord[] = teamToRecords(teams);
			const { data, error } = await supabase
				.schema("coderdojo")
				.from("teams")
				.upsert(teamRecords, { onConflict: "id" })
				.select();

			if (error || !data || data.length === 0) {
				log.error("Error saving teams:", { error });
				return [];
			}

			return teamFromRecords(data as TeamRecord[]);
		} catch (error) {
			throw new Error(`Error saving teams: ${ErrorToString(error)}`);
		}
	},

	/**
	 * Delete a team by id
	 */
	DeleteTeam: async (
		event: H3Event<EventHandlerRequest>,
		teamId: string,
	): Promise<boolean> => {
		const supabase = await GetSupabaseAdminClient(event);
		if (!supabase) {
			return false;
		}
		try {
			const { error } = await supabase
				.schema("coderdojo")
				.from("teams")
				.delete()
				.eq("id", teamId);

			if (error) {
				log.error("Error deleting team:", undefined, { error });
				return false;
			}

			return true;
		} catch (error) {
			log.error(`Error deleting team: ${ErrorToString(error)}`);
			return false;
		}
	},
};
