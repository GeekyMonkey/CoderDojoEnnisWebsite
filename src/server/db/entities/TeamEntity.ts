import { TeamModel } from "~~/shared/types/TeamModel";
import { teams } from "../schema/schemas";

export type TeamEntity = typeof teams.$inferSelect;

export const ToTeamModel = (entity: TeamEntity): TeamModel => {
	return {
		...entity,
	};
};
