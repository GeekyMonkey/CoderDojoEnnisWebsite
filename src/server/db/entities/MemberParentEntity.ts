import { MemberParentModel } from "~~/shared/types/models/MemberParentModel";
import { memberParents } from "../schema/schemas";

export type MemberParentEntity = typeof memberParents.$inferSelect;

/**
 * Convert a UI Model
 */
export const ToMemberParentModel = (
	entity: MemberParentEntity,
): MemberParentModel => {
	return {
		...entity,
	};
};

/**
 * Convert to an array of UI Models
 */
export const ToMemberParentModels = (
	entities: MemberParentEntity[],
): MemberParentModel[] => {
	return entities.map(ToMemberParentModel);
};
