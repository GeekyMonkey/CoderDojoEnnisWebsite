import { z } from "zod";
import type { Database } from "../../../types/supabase";

export type MemberParentRecord =
	Database["coderdojo"]["Tables"]["member_parents"]["Row"];

export const MemberParentModelSchema = z
	.object({
		id: z.string(),
		memberId: z.string(),
		parentId: z.string(),
	})
	.strict();

export type MemberParentModel = z.infer<typeof MemberParentModelSchema>;

export function memberParentFromRecord(
	record: MemberParentRecord,
): MemberParentModel {
	return MemberParentModelSchema.parse({
		id: record.id,
		memberId: record.member_id || "",
		parentId: record.parent_id || "",
	});
}

export function memberParentToRecord(
	model: MemberParentModel,
): MemberParentRecord {
	return {
		id: model.id,
		member_id: model.memberId,
		parent_id: model.parentId,
	} as MemberParentRecord;
}

export function memberParentFromRecords(
	records: MemberParentRecord[],
): MemberParentModel[] {
	return records.map(memberParentFromRecord);
}

export function memberParentToRecords(
	models: MemberParentModel[],
): MemberParentRecord[] {
	return models.map(memberParentToRecord);
}
