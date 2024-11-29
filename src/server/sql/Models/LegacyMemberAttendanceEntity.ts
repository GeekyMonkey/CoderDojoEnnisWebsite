import { MemberAttendanceEntity } from "~~/server/db/entities";

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
		memberId: legacy.MemberId,
		date: new Date(legacy.Date),
	};
};

export const FromLegacyMemberAttendanceEntities = (
	legacies: LegacyMemberAttendanceEntity[],
): MemberAttendanceEntity[] => {
	let attendances = legacies.map(FromLegacyMemberAttendanceEntity);

	// Remove duplicates
	attendances = attendances.filter(
		(attendance, index, self) =>
			index ===
			self.findIndex(
				(t) =>
					t.memberId === attendance.memberId &&
					t.date === attendance.date,
			),
	);

	return attendances;
};
