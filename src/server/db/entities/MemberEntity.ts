import { MemberModel } from "~~/shared/types/MemberModel";
import { members } from "../schema/schemas";
import { DateToNumberOrNull } from "~~/shared/utils/DateHelpers";

export type MemberEntity = typeof members.$inferSelect;

export const ToMemberModel = (entity: MemberEntity): MemberModel => {
	return {
		...entity,
		loginDate: DateToNumberOrNull(entity.loginDate),
		loginDatePrevious: DateToNumberOrNull(entity.loginDatePrevious),
	};
};
