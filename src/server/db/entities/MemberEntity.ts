import { MemberModel } from "~~/shared/types/models/MemberModel";
import { members } from "../schema/schemas";
import { DateToNumberOrNull } from "~~/shared/utils/DateHelpers";

export type MemberEntity = typeof members.$inferSelect;

/**
 * Convert a UI Model
 */
export const ToMemberModel = (entity: MemberEntity): MemberModel => {
	// Exclude private properties
	const { passwordHash, ...rest } = entity;

	return {
		...rest,
		loginDate: DateToNumberOrNull(entity.loginDate),
		loginDatePrevious: DateToNumberOrNull(entity.loginDatePrevious),
	};
};

/**
 * Convert to an array of UI Models
 */
export const ToMemberModels = (entities: MemberEntity[]): MemberModel[] => {
	return entities.map(ToMemberModel);
};
