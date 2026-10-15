import {
	showcaseItem,
	type ShowcaseRow,
	type ShowcaseOwner,
} from "#server/utils/showcase";
import type { ShowcaseItem } from "#shared/types/Showcase";
import { createError } from "h3";
import { beltFromRecord } from "#shared/types/models/BeltModel";

import type { SupabaseClientType } from "./DatabaseClient";
import type { Database } from "../../types/supabase";
import {
	AchievementReviewSchema,
	type AchievementDecision,
	type AchievementKind,
	type AchievementReview,
} from "#shared/types/AchievementReview";

type AchievementRecord =
	| Database["coderdojo"]["Tables"]["member_badges"]["Row"]
	| Database["coderdojo"]["Tables"]["member_belts"]["Row"];

/** Convert stored dates into client timestamps. */
function timestamp(value: string | null): number | null {
	return value
		? Date.parse(
				/(?:Z|[+-]\d{2}:?\d{2})$/.test(value)
					? value
					: `${value.replace(" ", "T")}Z`,
			)
		: null;
}

/** Read visible pending applications or a member's complete achievement history. */
export async function getAchievementReviews(
	client: SupabaseClientType,
	kind: AchievementKind,
	memberId?: string,
	mentorId: string | null = null,
): Promise<AchievementReview[]> {
	const table: "member_badges" | "member_belts" =
		kind === "badge" ? "member_badges" : "member_belts";
	const { error: repairError } = await client
		.schema("coderdojo")
		.rpc("repair_application_showcase", {
			p_kind: kind,
			...(memberId ? { p_member: memberId } : {}),
		});
	if (repairError)
		throw createError({
			statusCode: 503,
			statusMessage: "Unable to repair application links",
		});
	const query: ReturnType<
		ReturnType<ReturnType<typeof client.schema>["from"]>["select"]
	> = client.schema("coderdojo").from(table).select("*");
	if (memberId) query.eq("member_id", memberId);
	else
		query
			.not("application_date", "is", null)
			.is("awarded", null)
			.is("rejected_date", null);
	const { data, error } = await query.order("application_date", {
		ascending: false,
	});
	if (error)
		throw createError({
			statusCode: 503,
			statusMessage: "Unable to load achievements",
		});
	const records: AchievementRecord[] = (data ?? []) as AchievementRecord[];
	if (!records.length && !memberId) return [];
	const ids: string[] = memberId
		? [memberId]
		: [
				...new Set(
					records.map(
						(record: AchievementRecord): string => record.member_id ?? "",
					),
				),
			];
	const { data: members, error: memberError } = await client
		.schema("coderdojo")
		.from("members")
		.select(
			"id,name_first,name_last,login,has_avatar,has_photo,is_ninja,is_parent,is_mentor,github_login,scratch_name,deleted",
		)
		.in("id", ids)
		.eq("deleted", false);
	const { data: badges, error: badgeError } = await client
		.schema("coderdojo")
		.from("badges")
		.select("*");
	const { data: belts, error: beltError } = await client
		.schema("coderdojo")
		.from("belts")
		.select("*");
	const { data: categories, error: categoryError } = await client
		.schema("coderdojo")
		.from("badge_categories")
		.select("id, category_name");
	if (memberError || badgeError || beltError || categoryError)
		throw createError({
			statusCode: 503,
			statusMessage: "Unable to load achievement details",
		});
	const { data: links, error: linkError } = mentorId
		? await client
				.schema("coderdojo")
				.from("member_parents")
				.select("member_id")
				.eq("parent_id", mentorId)
		: { data: [], error: null };
	if (linkError)
		throw createError({
			statusCode: 503,
			statusMessage: "Unable to load review permissions",
		});
	if (memberId && !members?.length)
		throw createError({ statusCode: 404, statusMessage: "Member unavailable" });
	const children: Set<string> = new Set(
		(links ?? []).map((link: { member_id: string }): string => link.member_id),
	);
	const showcaseIds: string[] = [
		...new Set(
			records.flatMap(
				(record: AchievementRecord): string[] => record.showcase_item_ids,
			),
		),
	];
	const cards: Map<string, ShowcaseItem> = new Map();
	// Page bounded IN queries so large mentor queues do not exceed URL limits.
	for (let offset: number = 0; offset < showcaseIds.length; offset += 100) {
		const { data: projects, error: projectError } = await client
			.schema("coderdojo")
			.from("member_showcase")
			.select("*")
			.in("id", showcaseIds.slice(offset, offset + 100));
		if (projectError)
			throw createError({
				statusCode: 503,
				statusMessage: "Unable to load application projects",
			});
		for (const project of (projects ?? []) as ShowcaseRow[]) {
			const owner: ShowcaseOwner | undefined = members?.find(
				(member: ShowcaseOwner): boolean => member.id === project.member_id,
			);
			if (owner) cards.set(project.id, showcaseItem(client, project, owner));
		}
	}
	const reviews: AchievementReview[] = [];
	for (const record of records) {
		const member: NonNullable<typeof members>[number] | null =
			members?.find(
				(item: NonNullable<typeof members>[number]): boolean =>
					item.id === record.member_id,
			) ?? null;
		const badge: NonNullable<typeof badges>[number] | null =
			"badge_id" in record
				? (badges?.find(
						(item: NonNullable<typeof badges>[number]): boolean =>
							item.id === record.badge_id,
					) ?? null)
				: null;
		const belt: NonNullable<typeof belts>[number] | null =
			"belt_id" in record
				? (belts?.find(
						(item: NonNullable<typeof belts>[number]): boolean =>
							item.id === record.belt_id,
					) ?? null)
				: null;
		if (!member || (!badge && !belt)) continue;
		reviews.push({
			showcaseItemIds: record.showcase_item_ids.filter((id: string): boolean =>
				cards.has(id),
			),
			showcaseItems: record.showcase_item_ids.flatMap(
				(id: string): ShowcaseItem[] => (cards.has(id) ? [cards.get(id)!] : []),
			),
			id: record.id,
			definitionId: badge?.id ?? belt!.id,
			definitionDeleted: badge?.deleted ?? belt!.deleted,
			goalDate: "goal_date" in record ? timestamp(record.goal_date) : null,
			memberId: member.id,
			canReview: !children.has(member.id),
			memberName: `${member.name_first ?? ""} ${member.name_last ?? ""}`.trim(),
			kind,
			categoryId: badge?.badge_category_id ?? null,
			categoryName:
				categories?.find(
					(category: NonNullable<typeof categories>[number]): boolean =>
						category.id === badge?.badge_category_id,
				)?.category_name ?? null,
			belt: belt ? beltFromRecord(belt) : null,
			sortOrder: belt?.sort_order ?? 0,
			label: badge?.achievement ?? belt?.color ?? "",
			description: badge?.description ?? belt?.description ?? "",
			applicationDate: timestamp(record.application_date),
			applicationNotes: record.application_notes,
			awarded: timestamp(record.awarded),
			awardedNotes: record.awarded_notes,
			awardedByAdultId: record.awarded_by_adult_id,
			rejectedDate: timestamp(record.rejected_date),
			rejectedNotes: record.rejected_notes,
			rejectedByAdultId: record.rejected_by_adult_id,
		});
	}
	// Include active definitions without records; preserve recorded deleted definitions above.
	if (memberId && members?.length) {
		const member: NonNullable<typeof members>[number] = members[0]!;
		const definitions: (
			NonNullable<typeof badges>[number] | NonNullable<typeof belts>[number]
		)[] = kind === "badge" ? (badges ?? []) : (belts ?? []);
		for (const definition of definitions) {
			if (
				definition.deleted ||
				reviews.some(
					(review: AchievementReview): boolean =>
						review.definitionId === definition.id,
				)
			)
				continue;
			const badge: NonNullable<typeof badges>[number] | null =
				"achievement" in definition ? definition : null;
			const belt: NonNullable<typeof belts>[number] | null =
				"color" in definition ? definition : null;
			reviews.push({
				id: `available:${definition.id}`,
				definitionId: definition.id,
				definitionDeleted: false,
				goalDate: null,
				memberId,
				memberName:
					`${member.name_first ?? ""} ${member.name_last ?? ""}`.trim(),
				canReview: !children.has(memberId),
				kind,
				categoryId: badge?.badge_category_id ?? null,
				categoryName:
					categories?.find(
						(category: NonNullable<typeof categories>[number]): boolean =>
							category.id === badge?.badge_category_id,
					)?.category_name ?? null,
				belt: belt ? beltFromRecord(belt) : null,
				sortOrder: belt?.sort_order ?? 0,
				label: badge?.achievement ?? belt?.color ?? "",
				description: badge?.description ?? belt?.description ?? "",
				applicationDate: null,
				applicationNotes: null,
				awarded: null,
				awardedNotes: null,
				awardedByAdultId: null,
				rejectedDate: null,
				rejectedNotes: null,
				rejectedByAdultId: null,
			});
		}
	}
	return AchievementReviewSchema.array().parse(reviews);
}

/** Atomically update a decision only while the database still matches its original state. */
export async function decideAchievement(
	client: SupabaseClientType,
	mentorId: string,
	decision: AchievementDecision,
): Promise<void> {
	const { error } = await client.schema("coderdojo").rpc("decide_achievement", {
		p_actor: mentorId,
		p_kind: decision.kind,
		p_id: decision.id,
		p_action: decision.action,
		p_notes: decision.notes,
		p_expected_awarded:
			decision.expectedAwarded === null
				? null
				: new Date(decision.expectedAwarded).toISOString(),
		p_expected_rejected:
			decision.expectedRejected === null
				? null
				: new Date(decision.expectedRejected).toISOString(),
	});
	if (error)
		throw createError({
			statusCode:
				error.code === "42501"
					? 403
					: error.code === "P0002"
						? 404
						: ["40001", "P0001"].includes(error.code)
							? 409
							: error.code === "22023"
								? 400
								: 503,
			statusMessage: ["42501", "P0002", "40001", "P0001", "22023"].includes(
				error.code,
			)
				? error.message
				: "Unable to save decision",
		});
}
