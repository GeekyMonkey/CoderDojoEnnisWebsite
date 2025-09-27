import { TeamModel } from "~~/shared/types/models/TeamModel";

/**
 * SQL Server Team Entity
 */
export type LegacyTeamEntity = {
	Id: string;
	Deleted: boolean;
	Goal: string | null;
	HexCode: string | null;
	Notes: string | null;
	TeamName: string;
};

export const FromLegacyTeamEntity = (legacy: LegacyTeamEntity): TeamModel => {
	return {
		id: legacy.Id,
		deleted: legacy.Deleted,
		goal: legacy.Goal,
		hexcode: legacy.HexCode,
		notes: legacy.Notes,
		teamName: legacy.TeamName,
	};
};

export const FromLegacyTeamEntities = (
	legacies: LegacyTeamEntity[],
): TeamModel[] => {
	return legacies.map(FromLegacyTeamEntity);
};
