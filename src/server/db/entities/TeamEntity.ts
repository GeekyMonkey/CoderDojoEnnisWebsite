import { TeamModel, TeamModelSchema } from "~~/shared/types/models/TeamModel";
import { teams } from "../schema/schemas";

export type TeamEntity = typeof teams.$inferSelect;

/**
 * Convert a UI Model
 */
export const ToTeamModel = (entity: TeamEntity): TeamModel => {
	const data: TeamModel = TeamModelSchema.parse(entity);
	return data;
};

/**
 * Convert to an array of UI Models
 */
export const ToTeamModels = (entities: TeamEntity[]): TeamModel[] => {
	return entities.map(ToTeamModel);
};
