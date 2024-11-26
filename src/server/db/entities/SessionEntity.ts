import { SessionModel } from "~~/shared/types/models/SessionModel";
import { sessions } from "../schema/schemas";

export type SessionEntity = typeof sessions.$inferSelect;

/**
 * Convert a UI Model
 */
export const ToSessionModel = (entity: SessionEntity): SessionModel => {
	return {
		...entity,
		createdDate: entity.createdDate.getTime(),
		endDate: entity.endDate ? entity.endDate.getTime() : null,
	};
};

/**
 * Convert to an array of UI Models
 */
export const ToSessionModels = (entities: SessionEntity[]): SessionModel[] => {
	return entities.map(ToSessionModel);
};
