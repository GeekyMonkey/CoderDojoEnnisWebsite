import { MemberBeltModel } from "~~/shared/types/MemberBeltModel";
import { memberBelts } from "../schema/schemas";
import { DateToNumberOrNull } from "~~/shared/utils/DateHelpers";

export type MemberBeltEntity = typeof memberBelts.$inferSelect;

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
