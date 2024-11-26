import { BeltModel } from "~~/shared/types/models/BeltModel";
import { belts } from "../schema/schemas";

export type BeltEntity = typeof belts.$inferSelect;

/**
 * Convert a UI Model
 */
export const ToBeltModel = (entity: BeltEntity): BeltModel => {
	return {
		...entity,
	};
};

/**
 * Convert to an array of UI Models
 */
export const ToBeltModels = (entities: BeltEntity[]): BeltModel[] => {
	return entities.map(ToBeltModel);
};
