/**
 * SQL Server Member-Attendance Entity
 */
export type LegacyMemberAttendanceEntity = {
	Id: string;
	MemberId: string;
	Date: string;
};

export const FromLegacyMemberAttendanceEntity = (
	legacy: LegacyMemberAttendanceEntity,
): MemberAttendanceEntity => {
	return {
		id: legacy.Id,
		member_id: legacy.MemberId,
		date: legacy.Date,
	};
};

export const FromLegacyMemberAttendanceEntities = (
	legacies: LegacyMemberAttendanceEntity[],
): MemberAttendanceEntity[] => {
	return legacies.map(FromLegacyMemberAttendanceEntity);
};
