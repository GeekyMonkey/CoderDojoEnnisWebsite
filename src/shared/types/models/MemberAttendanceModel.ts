import { z } from "zod";
import type { Database } from "../../../types/supabase";
import { DateStringSchema } from "../../utils/DateHelpers";

export type MemberAttendanceRecord =
	Database["coderdojo"]["Tables"]["member_attendances"]["Row"];

export const MemberAttendanceModelSchema = z.strictObject({
	id: z.string(),
	memberId: z.string(),
	date: DateStringSchema,
	deleted: z.boolean().default(false),
});
export const MemberAttendanceModelArraySchema = z.array(
	MemberAttendanceModelSchema,
);

export type MemberAttendanceModel = z.infer<typeof MemberAttendanceModelSchema>;
export type MemberAttendanceModelArray = z.infer<
	typeof MemberAttendanceModelArraySchema
>;

export function memberAttendanceFromRecord(
	record: MemberAttendanceRecord,
): MemberAttendanceModel {
	return MemberAttendanceModelSchema.parse({
		id: record.id,
		memberId: record.member_id || "", // enforce non-null with fallback
		date: record.date || "",
		deleted: false,
	});
}

export function memberAttendanceToRecord(
	model: MemberAttendanceModel,
): MemberAttendanceRecord {
	return {
		id: model.id,
		member_id: model.memberId,
		date: model.date,
	};
}

export function memberAttendanceFromRecords(
	records: MemberAttendanceRecord[],
): MemberAttendanceModelArray {
	return records.map(memberAttendanceFromRecord);
}

export function memberAttendanceToRecords(
	models: MemberAttendanceModelArray,
): MemberAttendanceRecord[] {
	return models.map(memberAttendanceToRecord);
}
