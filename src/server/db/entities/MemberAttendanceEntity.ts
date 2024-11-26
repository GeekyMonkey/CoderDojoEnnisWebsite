import { MemberAttendanceModel } from "~~/shared/types/models/MemberAttendanceModel";
import { memberAttendances } from "../schema/schemas";

export type MemberAttendanceEntity = typeof memberAttendances.$inferSelect;

/**
 * Convert a UI Model
 */
export const ToMemberAttendanceModel = (
	entity: MemberAttendanceEntity,
): MemberAttendanceModel => {
	return {
		...entity,
		date: entity.date.toDateString(),
	};
};

/**
 * Convert to an array of UI Models
 */
export const ToMemberAttendanceModels = (
	entities: MemberAttendanceEntity[],
): MemberAttendanceModel[] => {
	return entities.map(ToMemberAttendanceModel);
};
