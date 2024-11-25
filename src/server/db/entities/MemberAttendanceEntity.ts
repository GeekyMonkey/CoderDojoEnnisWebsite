import { MemberAttendanceModel } from "~~/shared/types/MemberAttendanceModel";
import { memberAttendances } from "../schema/schemas";

export type MemberAttendanceEntity = typeof memberAttendances.$inferSelect;

export const ToMemberAttendanceModel = (
	entity: MemberAttendanceEntity,
): MemberAttendanceModel => {
	return {
		...entity,
	};
};
