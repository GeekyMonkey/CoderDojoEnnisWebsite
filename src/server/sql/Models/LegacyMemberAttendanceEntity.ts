import { type MemberAttendanceModel } from "#shared/types/models/MemberAttendanceModel";

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
): MemberAttendanceModel => {
	const d = new Date(legacy.Date);
	return {
		id: legacy.Id,
		memberId: legacy.MemberId,
		date: d.toISOString().substring(0, 10),
		deleted: false,
	};
};

export const FromLegacyMemberAttendanceEntities = (
	legacies: LegacyMemberAttendanceEntity[],
): MemberAttendanceModel[] => {
	let attendances = legacies.map(FromLegacyMemberAttendanceEntity);

	// Remove duplicates
	attendances = attendances.filter(
		(attendance, index, self) =>
			index ===
			self.findIndex(
				(t) => t.memberId === attendance.memberId && t.date === attendance.date,
			),
	);

	return attendances;
};
