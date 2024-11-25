import { MemberBadgeModel } from "~~/shared/types/MemberBadgeModel";
import { memberBadges } from "../schema/schemas";
import { DateToNumberOrNull } from "~~/shared/utils/DateHelpers";

export type MemberBadgeEntity = typeof memberBadges.$inferSelect;

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
