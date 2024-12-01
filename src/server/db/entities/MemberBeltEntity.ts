import { MemberBeltModel } from "~~/shared/types/models/MemberBeltModel";
import { memberBelts } from "../schema/schemas";
import { DateToNumberOrNull } from "~~/shared/utils/DateHelpers";

export type MemberBeltEntity = typeof memberBelts.$inferSelect;

/**
 * Convert a UI Model
 */
export const ToMemberBeltModel = (
	entity: MemberBeltEntity,
): MemberBeltModel => {
	return {
		...entity,
		applicationDate: DateToNumberOrNull(entity.applicationDate),
		rejectedDate: DateToNumberOrNull(entity.rejectedDate),
		awarded: DateToNumberOrNull(entity.awarded),
	};
};

/**
 * Convert to an array of UI Models
 */
export const ToMemberBeltModels = (
	entities: MemberBeltEntity[],
): MemberBeltModel[] => {
	return entities.map(ToMemberBeltModel);
};
