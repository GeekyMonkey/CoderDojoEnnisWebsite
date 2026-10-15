import type { EventHandlerRequest, H3Event } from "h3";
import { createError, getHeader } from "h3";
import { GetSupabaseAdminClient } from "#server/db/DatabaseClient";
import { MembersData } from "#server/db/MembersData";
import type { MemberModel } from "#shared/types/models/MemberModel";
import { useLogger } from "#shared/utils/Logger";

const log = useLogger("requestMember");

const MEMBER_EMAIL_DOMAIN: string = "@coderdojoennis.com";

/**
 * Extract the member id from the Supabase auth email (`<memberId>@coderdojoennis.com`).
 * The email is set server-side at login, unlike user_metadata which users can edit.
 */
export function MemberIdFromSupabaseEmail(
	email: string | null | undefined,
): string | null {
	const lower: string = (email ?? "").trim().toLowerCase();
	if (!lower.endsWith(MEMBER_EMAIL_DOMAIN)) {
		return null;
	}
	const memberId: string = lower.slice(0, -MEMBER_EMAIL_DOMAIN.length);
	return memberId.length > 0 ? memberId : null;
}

/**
 * Resolve the logged-in member for an API request from its Bearer access token.
 * Throws 401 if the caller is not a logged-in, non-deleted member.
 */
export async function GetRequestMember(
	event: H3Event<EventHandlerRequest>,
): Promise<MemberModel> {
	const authHeader: string = getHeader(event, "authorization") ?? "";
	const token: string = authHeader.replace(/^Bearer\s+/i, "").trim();
	if (!token) {
		throw createError({ statusCode: 401, statusMessage: "Not logged in" });
	}

	const supabase = await GetSupabaseAdminClient(event);
	if (!supabase) {
		throw createError({
			statusCode: 500,
			statusMessage: "Database unavailable",
		});
	}

	const { data, error } = await supabase.auth.getUser(token);
	if (error || !data.user) {
		log.warn("Invalid access token", { error: error?.message });
		throw createError({ statusCode: 401, statusMessage: "Not logged in" });
	}

	const memberId: string | null = MemberIdFromSupabaseEmail(data.user.email);
	if (!memberId) {
		throw createError({ statusCode: 401, statusMessage: "Not a member" });
	}

	const member: MemberModel | null = await MembersData.GetMemberById(
		event,
		memberId,
	);
	if (!member || member.deleted) {
		throw createError({ statusCode: 401, statusMessage: "Not a member" });
	}

	return member;
}

/**
 * Resolve the logged-in member and require the mentor role (from the members table).
 */
export async function GetRequestMentor(
	event: H3Event<EventHandlerRequest>,
): Promise<MemberModel> {
	const member: MemberModel = await GetRequestMember(event);
	if (!member.isMentor) {
		throw createError({ statusCode: 403, statusMessage: "Mentors only" });
	}
	return member;
}
