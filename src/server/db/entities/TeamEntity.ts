import { TeamModel } from "~~/shared/types/models/TeamModel";
import { teams } from "../schema/schemas";

export type TeamEntity = typeof teams.$inferSelect;

/**
 * Convert a UI Model
 */
export const ToTeamModel = (entity: TeamEntity): TeamModel => {
	return {
		...entity,
	};
};

/**
 * Convert to an array of UI Models
 */
export const ToTeamModels = (entities: TeamEntity[]): TeamModel[] => {
	return entities.map(ToTeamModel);
};
