import { BadgeModel } from "~~/shared/types/BadgeModel";
import { badges } from "../schema/schemas";

export type BadgeEntity = typeof badges.$inferSelect;

export const ToBadgeModel = (entity: BadgeEntity): BadgeModel => {
	return {
		...entity,
	};
};
