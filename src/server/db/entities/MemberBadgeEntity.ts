import { MemberBadgeModel } from "~~/shared/types/models/MemberBadgeModel";
import { memberBadges } from "../schema/schemas";
import { DateToNumberOrNull } from "~~/shared/utils/DateHelpers";

export type MemberBadgeEntity = typeof memberBadges.$inferSelect;

/**
 * Convert a UI Model
 */
export const ToMemberBadgeModel = (
	entity: MemberBadgeEntity,
): MemberBadgeModel => {
	return {
		...entity,
		applicationDate: DateToNumberOrNull(entity.applicationDate),
		rejectedDate: DateToNumberOrNull(entity.rejectedDate),
		awarded: DateToNumberOrNull(entity.awarded),
		goalDate: DateToNumberOrNull(entity.goalDate),
	};
};

/**
 * Convert to an array of UI Models
 */
export const ToMemberBadgeModels = (
	entities: MemberBadgeEntity[],
): MemberBadgeModel[] => {
	return entities.map(ToMemberBadgeModel);
};
