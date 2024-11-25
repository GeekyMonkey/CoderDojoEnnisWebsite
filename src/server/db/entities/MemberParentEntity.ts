import { MemberParentModel } from "~~/shared/types/MemberParentModel";
import { memberParents } from "../schema/schemas";

export type MemberParentEntity = typeof memberParents.$inferSelect;

export const ToMemberParentModel = (
	entity: MemberParentEntity,
): MemberParentModel => {
	return {
		...entity,
	};
};
