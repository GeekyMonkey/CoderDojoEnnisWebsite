import { z } from "zod";
import type { Database } from "../../../types/supabase";

export type MemberBeltRecord =
	Database["coderdojo"]["Tables"]["member_belts"]["Row"];

export const MemberBeltModelSchema = z.strictObject({
	id: z.string(),
	memberId: z.string(),
	beltId: z.string(),
	awardedByAdultId: z.string().nullable(),
	applicationNotes: z.string().nullable(),
	awardedNotes: z.string().nullable(),
	rejectedByAdultId: z.string().nullable(),
	rejectedNotes: z.string().nullable(),
	applicationDate: z.number().nullable(),
	awarded: z.number().nullable(),
	rejectedDate: z.number().nullable(),
	deleted: z.boolean().default(false),
});

export type MemberBeltModel = z.infer<typeof MemberBeltModelSchema>;

export const MemberBeltWithBeltDetailModelSchema = MemberBeltModelSchema.extend(
	{
		belt: BeltModelSchema,
	},
);
export type MemberBeltWithBeltDetailModel = z.infer<
	typeof MemberBeltWithBeltDetailModelSchema
>;

export function memberBeltFromRecord(
	record: MemberBeltRecord,
): MemberBeltModel {
	return MemberBeltModelSchema.parse({
		id: record.id,
		memberId: record.member_id || "",
		beltId: record.belt_id || "",
		awardedByAdultId: record.awarded_by_adult_id,
		applicationNotes: record.application_notes,
		awardedNotes: record.awarded_notes,
		rejectedByAdultId: record.rejected_by_adult_id,
		rejectedNotes: record.rejected_notes,
		applicationDate: record.application_date
			? Date.parse(record.application_date)
			: null,
		awarded: record.awarded ? Date.parse(record.awarded) : null,
		rejectedDate: record.rejected_date
			? Date.parse(record.rejected_date)
			: null,
		deleted: false,
	});
}

export function memberBeltToRecord(model: MemberBeltModel): MemberBeltRecord {
	return {
		id: model.id,
		member_id: model.memberId,
		belt_id: model.beltId,
		awarded_by_adult_id: model.awardedByAdultId,
		application_notes: model.applicationNotes,
		awarded_notes: model.awardedNotes,
		rejected_by_adult_id: model.rejectedByAdultId,
		rejected_notes: model.rejectedNotes,
		application_date: model.applicationDate
			? new Date(model.applicationDate).toISOString()
			: null,
		awarded: model.awarded ? new Date(model.awarded).toISOString() : null,
		rejected_date: model.rejectedDate
			? new Date(model.rejectedDate).toISOString()
			: null,
	} as MemberBeltRecord;
}

export function memberBeltFromRecords(
	records: MemberBeltRecord[],
): MemberBeltModel[] {
	return records.map(memberBeltFromRecord);
}

export function memberBeltToRecords(
	models: MemberBeltModel[],
): MemberBeltRecord[] {
	return models.map(memberBeltToRecord);
}
