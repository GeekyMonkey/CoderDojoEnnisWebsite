import { BeltModel } from "~~/shared/types/BeltModel";
import { belts } from "../schema/schemas";

export type BeltEntity = typeof belts.$inferSelect;

export const ToBeltModel = (entity: BeltEntity): BeltModel => {
	return {
		...entity,
	};
};
