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
): MemberAttendanceEntity => {
	return {
		id: legacy.Id,
		member_id: legacy.MemberId,
		date: legacy.Date,
	};
};

export const FromLegacyAdultAttendanceEntities = (
	legacies: LegacyAdultAttendanceEntity[],
): MemberAttendanceEntity[] => {
	return legacies.map(FromLegacyAdultAttendanceEntity);
};
