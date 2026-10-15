import { createError, getQuery, type H3Event } from "h3";
import {
	GetSupabaseAdminClient,
	type SupabaseClientType,
} from "#server/db/DatabaseClient";
import { requireRequestMember, type VerifiedMember } from "./requestMember";
import type { ShowcaseItem, ShowcaseRole } from "#shared/types/Showcase";
import type { MemberRecord } from "#shared/types/models/MemberModel";
import { FormatBucketFileName } from "#shared/types/Supabase";

export type ShowcaseRow = {
	id: string;
	member_id: string;
	title: string;
	description: string;
	project_type: ShowcaseItem["projectType"];
	url: string | null;
	thumbnail_path: string | null;
	thumbnail_version: number;
	source_project_id: string | null;
	showcase_date: string;
	is_visible: boolean;
	created_at: string;
	updated_at: string;
};
export type ShowcaseOwner = Pick<
	MemberRecord,
	| "id"
	| "name_first"
	| "name_last"
	| "login"
	| "has_avatar"
	| "has_photo"
	| "is_ninja"
	| "is_parent"
	| "is_mentor"
	| "github_login"
	| "scratch_name"
	| "deleted"
>;
/** Require a database connection without exposing its credentials. */
export async function showcaseClient(
	event: H3Event,
): Promise<SupabaseClientType> {
	const client: SupabaseClientType | null = await GetSupabaseAdminClient(event);
	if (!client)
		throw createError({
			statusCode: 503,
			statusMessage: "Showcase unavailable",
		});
	return client;
}
/** Resolve the owner and enforce member/linked-parent/mentor authorization. */
export async function showcaseActor(
	event: H3Event,
): Promise<{ actor: VerifiedMember; owner: ShowcaseOwner }> {
	const actor: VerifiedMember = await requireRequestMember(event);
	const memberId: string = String(getQuery(event).memberId || actor.id);
	if (!/^[\da-f-]{36}$/i.test(memberId))
		throw createError({ statusCode: 400, statusMessage: "Invalid member" });
	const { data: owner, error } = await actor.client
		.schema("coderdojo")
		.from("members")
		.select(
			"id,name_first,name_last,login,has_avatar,has_photo,is_ninja,is_parent,is_mentor,github_login,scratch_name,deleted",
		)
		.eq("id", memberId)
		.maybeSingle();
	if (error || !owner || owner.deleted)
		throw createError({ statusCode: 404, statusMessage: "Member unavailable" });
	if (actor.id !== memberId && !actor.member.isMentor) {
		const { data: link, error: linkError } = await actor.readClient
			.schema("coderdojo")
			.from("member_parents")
			.select("id")
			.eq("member_id", memberId)
			.eq("parent_id", actor.id)
			.maybeSingle();
		if (!actor.member.isParent || !owner.is_ninja || linkError || !link)
			throw createError({
				statusCode: 403,
				statusMessage: "Showcase access denied",
			});
	}
	return { actor, owner: owner as ShowcaseOwner };
}
/** Project only public presentation fields for cards. */
export function showcaseItem(
	client: SupabaseClientType,
	row: ShowcaseRow,
	owner: ShowcaseOwner,
): ShowcaseItem {
	const roles: ShowcaseRole[] = [];
	if (owner.is_ninja) roles.push("coder");
	if (owner.is_parent) roles.push("parent");
	if (owner.is_mentor) roles.push("mentor");
	const image: (folder: string) => string = (folder: string): string =>
		client.storage
			.from("coderdojo")
			.getPublicUrl(
				`${folder}/${FormatBucketFileName("Member", owner.id, "png")}`,
			).data.publicUrl;
	return {
		id: row.id,
		memberId: row.member_id,
		title: row.title,
		description: row.description,
		projectType: row.project_type,
		url: row.url ?? "",
		thumbnailUrl: row.thumbnail_path
			? client.storage.from("showcase").getPublicUrl(row.thumbnail_path).data
					.publicUrl
			: null,
		sourceProjectId: row.source_project_id,
		showcaseDate: row.showcase_date,
		isVisible: row.is_visible,
		createdAt: row.created_at,
		updatedAt: row.updated_at,
		memberName:
			[owner.name_first, owner.name_last].filter(Boolean).join(" ") ||
			owner.login ||
			"Member",
		username: owner.login ?? "",
		roles,
		avatarUrl: owner.has_avatar
			? `${image("Avatars")}?v=${encodeURIComponent(row.updated_at)}`
			: null,
		photoUrl: owner.has_photo
			? `${image("Photos")}?v=${encodeURIComponent(row.updated_at)}`
			: null,
	};
}
/** Report database failures without leaking database internals. */
export function showcaseFailure(error: unknown): never {
	throw createError({
		statusCode: 503,
		statusMessage: "Unable to save showcase; reload and retry",
		cause: error,
	});
}

/** Read every page instead of silently truncating at the Data API row limit. */
export async function showcaseRows(
	client: SupabaseClientType,
	memberId: string | null = null,
): Promise<ShowcaseRow[]> {
	const rows: ShowcaseRow[] = [];
	for (let offset: number = 0; ; offset += 500) {
		let query = client
			.schema("coderdojo")
			.from("member_showcase")
			.select("*")
			.order("showcase_date", { ascending: false })
			.order("created_at", { ascending: false })
			.order("id", { ascending: false })
			.range(offset, offset + 499);
		query = memberId
			? query.eq("member_id", memberId)
			: query.eq("is_visible", true);
		const { data, error } = await query;
		if (error) showcaseFailure(error);
		rows.push(...(data as ShowcaseRow[]));
		if (data.length < 500) return rows;
	}
}
