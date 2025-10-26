import { z } from "zod";
import type { Database } from "../../../types/supabase";

export type MemberBadgeCategoryRecord =
	Database["coderdojo"]["Tables"]["member_badge_categories"]["Row"];

export const MemberBadgeCategoryModelSchema = z
	.object({
		id: z.string(),
		memberId: z.string(),
		badgeCategoryId: z.string(),
	})
	.strict();

export type MemberBadgeCategoryModel = z.infer<
	typeof MemberBadgeCategoryModelSchema
>;

export function memberBadgeCategoryFromRecord(
	record: MemberBadgeCategoryRecord,
): MemberBadgeCategoryModel {
	return MemberBadgeCategoryModelSchema.parse({
		id: record.id,
		memberId: record.member_id || "",
		badgeCategoryId: record.badge_category_id || "",
	});
}

export function memberBadgeCategoryToRecord(
	model: MemberBadgeCategoryModel,
): MemberBadgeCategoryRecord {
	return {
		id: model.id,
		member_id: model.memberId,
		badge_category_id: model.badgeCategoryId,
	} as MemberBadgeCategoryRecord;
}

export function memberBadgeCategoryFromRecords(
	records: MemberBadgeCategoryRecord[],
): MemberBadgeCategoryModel[] {
	return records.map(memberBadgeCategoryFromRecord);
}

export function memberBadgeCategoryToRecords(
	models: MemberBadgeCategoryModel[],
): MemberBadgeCategoryRecord[] {
	return models.map(memberBadgeCategoryToRecord);
}
