import { TeamEntity } from "~~/server/db/entities";

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

export const FromLegacyTeamEntity = (legacy: LegacyTeamEntity): TeamEntity => {
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
): TeamEntity[] => {
	return legacies.map(FromLegacyTeamEntity);
};
