import type { H3Event, EventHandlerRequest } from "h3";
import { GetSupabaseAdminClient, GetSupabaseClient } from "./DatabaseClient";
import type { Database } from "../../types/supabase";
import {
	teamFromRecords,
	type TeamModel,
} from "~~/shared/types/models/TeamModel";
import { ErrorToString } from "~~/shared/utils/ErrorHelpers";

/**
 * Custom types for Supabase schema
 */
export type TeamRecord = Database["coderdojo"]["Tables"]["teams"]["Row"];

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
		if (!supabase) return [];
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
				console.error("Error fetching teams:", error);
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
		if (!supabase) return [];
		try {
			const teamRecords: TeamRecord[] = teamToRecords(teams);
			const { data, error } = await supabase
				.schema("coderdojo")
				.from("teams")
				.upsert(teamRecords, { onConflict: "id" })
				.select();

			if (error || !data || data.length === 0) {
				console.error("Error saving teams:", error);
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
		if (!supabase) return false;
		try {
			const { error } = await supabase
				.schema("coderdojo")
				.from("teams")
				.delete()
				.eq("id", teamId);

			if (error) {
				console.error("Error deleting team:", error);
				return false;
			}

			return true;
		} catch (error) {
			console.error(`Error deleting team: ${ErrorToString(error)}`);
			return false;
		}
	},
};
