import { z } from "zod";
import type { Database } from "../../../types/supabase";
import { BadgeModelSchema } from "./BadgeModel";

export type MemberBadgeRecord =
  Database["coderdojo"]["Tables"]["member_badges"]["Row"];

export const MemberBadgeModelSchema = z.strictObject({
  id: z.string(),
  memberId: z.string(),
  badgeId: z.string(),
  awardedByAdultId: z.string().nullable(),
  applicationNotes: z.string().nullable(),
  awardedNotes: z.string().nullable(),
  rejectedByAdultId: z.string().nullable(),
  rejectedNotes: z.string().nullable(),
  applicationDate: z.number().nullable(),
  awarded: z.number().nullable(),
  rejectedDate: z.number().nullable(),
  goalDate: z.number().nullable(),
});

export type MemberBadgeModel = z.infer<typeof MemberBadgeModelSchema>;

export const MemberBadgeWithBadgeDetailsModelSchema = z.strictObject({
  ...MemberBadgeModelSchema.shape,
  badge: BadgeModelSchema,
});
export type MemberBadgeWithBadgeDetailsModel = z.infer<
  typeof MemberBadgeWithBadgeDetailsModelSchema
>;

export function memberBadgeFromRecord(
  record: MemberBadgeRecord,
): MemberBadgeModel {
  return MemberBadgeModelSchema.parse({
    id: record.id,
    memberId: record.member_id || "",
    badgeId: record.badge_id || "",
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
    goalDate: record.goal_date ? Date.parse(record.goal_date) : null,
  });
}

export function memberBadgeToRecord(
  model: MemberBadgeModel,
): MemberBadgeRecord {
  return {
    id: model.id,
    member_id: model.memberId,
    badge_id: model.badgeId,
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
    goal_date: model.goalDate ? new Date(model.goalDate).toISOString() : null,
  } as MemberBadgeRecord;
}

export function memberBadgeFromRecords(
  records: MemberBadgeRecord[],
): MemberBadgeModel[] {
  return records.map(memberBadgeFromRecord);
}

export function memberBadgeToRecords(
  models: MemberBadgeModel[],
): MemberBadgeRecord[] {
  return models.map(memberBadgeToRecord);
}
