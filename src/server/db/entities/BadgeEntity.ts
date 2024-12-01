import { BadgeModel } from "~~/shared/types/models/BadgeModel";
import { badges } from "../schema/schemas";

export type BadgeEntity = typeof badges.$inferSelect;

/**
 * Convert a UI Model
 */
export const ToBadgeModel = (entity: BadgeEntity): BadgeModel => {
	return {
		...entity,
	};
};

/**
 * Convert to an array of UI Models
 */
export const ToBadgeModels = (entities: BadgeEntity[]): BadgeModel[] => {
	return entities.map(ToBadgeModel);
};
