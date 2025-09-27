import { type MemberAttendanceModel } from "~~/shared/types/models/MemberAttendanceModel";

/**
 * SQL Server Adult-Attendance Entity
 */
export type LegacyAdultAttendanceEntity = {
	Id: string;
	MemberId: string;
	Date: string;
};

export const FromLegacyAdultAttendanceEntity = (
	legacy: LegacyAdultAttendanceEntity,
): MemberAttendanceModel => {
	const d = new Date(legacy.Date);
	return {
		id: legacy.Id,
		memberId: legacy.MemberId,
		date: d.toISOString().substring(0, 10),
	};
};

export const FromLegacyAdultAttendanceEntities = (
	legacies: LegacyAdultAttendanceEntity[],
): MemberAttendanceModel[] => {
	return legacies.map(FromLegacyAdultAttendanceEntity);
};
