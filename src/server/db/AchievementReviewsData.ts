import { createError } from "h3";
import { beltFromRecord } from "#shared/types/models/BeltModel";
import { canDecide, decisionFields, type DecisionFields } from "#shared/utils/AchievementDecisions";

import type { SupabaseClientType } from "./DatabaseClient";
import type { Database } from "../../types/supabase";
import { AchievementReviewSchema, type AchievementDecision, type AchievementKind, type AchievementReview } from "#shared/types/AchievementReview";

type AchievementRecord = Database["coderdojo"]["Tables"]["member_badges"]["Row"] | Database["coderdojo"]["Tables"]["member_belts"]["Row"];

/** Convert stored dates into client timestamps. */
function timestamp(value: string | null): number | null {
	return value ? Date.parse(value) : null;
}

/** Read visible pending applications or a member's complete achievement history. */
export async function getAchievementReviews(client: SupabaseClientType, kind: AchievementKind, memberId?: string): Promise<AchievementReview[]> {
	const table: "member_badges" | "member_belts" = kind === "badge" ? "member_badges" : "member_belts";
	const query: ReturnType<ReturnType<ReturnType<typeof client.schema>["from"]>["select"]> = client.schema("coderdojo").from(table).select("*");
	if (memberId) query.eq("member_id", memberId);
	else query.not("application_date", "is", null).is("awarded", null).is("rejected_date", null);
	const { data, error } = await query.order("application_date", { ascending: false });
	if (error) throw createError({ statusCode: 503, statusMessage: "Unable to load achievements" });
	const records: AchievementRecord[] = (data ?? []) as AchievementRecord[];
	if (!records.length) return [];
	const ids: string[] = [...new Set(records.map((record: AchievementRecord): string => record.member_id ?? ""))];
	const { data: members, error: memberError } = await client.schema("coderdojo").from("members").select("id, name_first, name_last").in("id", ids).eq("deleted", false);
	const { data: badges, error: badgeError } = await client.schema("coderdojo").from("badges").select("*");
	const { data: belts, error: beltError } = await client.schema("coderdojo").from("belts").select("*");
	const { data: categories, error: categoryError } = await client.schema("coderdojo").from("badge_categories").select("id, category_name");
	if (memberError || badgeError || beltError || categoryError) throw createError({ statusCode: 503, statusMessage: "Unable to load achievement details" });
	const reviews: AchievementReview[] = [];
	for (const record of records) {
		const member: NonNullable<typeof members>[number] | null = members?.find((item: NonNullable<typeof members>[number]): boolean => item.id === record.member_id) ?? null;
		const badge: NonNullable<typeof badges>[number] | null = "badge_id" in record ? badges?.find((item: NonNullable<typeof badges>[number]): boolean => item.id === record.badge_id) ?? null : null;
		const belt: NonNullable<typeof belts>[number] | null = "belt_id" in record ? belts?.find((item: NonNullable<typeof belts>[number]): boolean => item.id === record.belt_id) ?? null : null;
		if (!member || (!badge && !belt)) continue;
		reviews.push({ id: record.id, memberId: member.id, memberName: `${member.name_first ?? ""} ${member.name_last ?? ""}`.trim(), kind, categoryId: badge?.badge_category_id ?? null, categoryName: categories?.find((category: NonNullable<typeof categories>[number]): boolean => category.id === badge?.badge_category_id)?.category_name ?? null, belt: belt ? beltFromRecord(belt) : null, sortOrder: belt?.sort_order ?? 0, label: badge?.achievement ?? belt?.color ?? "", description: badge?.description ?? belt?.description ?? "", applicationDate: timestamp(record.application_date), applicationNotes: record.application_notes, awarded: timestamp(record.awarded), awardedNotes: record.awarded_notes, awardedByAdultId: record.awarded_by_adult_id, rejectedDate: timestamp(record.rejected_date), rejectedNotes: record.rejected_notes, rejectedByAdultId: record.rejected_by_adult_id });
	}
	return AchievementReviewSchema.array().parse(reviews);
}

/** Atomically update a decision only while the database still matches its original state. */
export async function decideAchievement(client: SupabaseClientType, mentorId: string, decision: AchievementDecision): Promise<void> {
	const table: "member_badges" | "member_belts" = decision.kind === "badge" ? "member_badges" : "member_belts";
	const { data: record, error } = await client.schema("coderdojo").from(table).select("*").eq("id", decision.id).maybeSingle();
	if (error) throw createError({ statusCode: 503, statusMessage: "Unable to load application" });
	if (!record) throw createError({ statusCode: 404, statusMessage: "Application not found" });
	if (!canDecide(record, decision)) throw createError({ statusCode: 409, statusMessage: "Application changed; refresh and try again" });
	if (!record.member_id) throw createError({ statusCode: 404, statusMessage: "Applicant not found" });
	const visible: AchievementReview[] = await getAchievementReviews(client, decision.kind, record.member_id);
	if (!visible.some((item: AchievementReview): boolean => item.id === record.id)) throw createError({ statusCode: 404, statusMessage: "Application not available" });
	const fields: DecisionFields = decisionFields(decision, mentorId, new Date().toISOString());
	let update: ReturnType<ReturnType<ReturnType<typeof client.schema>["from"]>["update"]> = client.schema("coderdojo").from(table).update(fields).eq("id", decision.id).eq("application_date", record.application_date!);
	update = record.awarded ? update.eq("awarded", record.awarded) : update.is("awarded", null);
	update = record.rejected_date ? update.eq("rejected_date", record.rejected_date) : update.is("rejected_date", null);
	const { data: changed, error: updateError } = await update.select("id");
	if (updateError) throw createError({ statusCode: 503, statusMessage: "Unable to save decision" });
	if (!changed?.length) throw createError({ statusCode: 409, statusMessage: "Application changed; refresh and try again" });
}
