import type { Session } from "@supabase/supabase-js";
import type { EventHandlerRequest, H3Event } from "h3";
import { useRuntimeConfig } from "#imports";
import { GetSupabaseAdminClient, type SupabaseClientType } from "~~/server/db/DatabaseClient";
import type { MemberRecord } from "~~/server/db/MembersData";
import { GeneratePasswordHash, LoginToSupabase } from "~~/server/utils/authUtils";
import { type MemberModel, type MemberSupabaseModel, memberFromRecord } from "~~/shared/types/models/MemberModel";

export type AuthServiceErrorCode =
	| "INVALID_INPUT"
	| "INVALID_PASSWORD_HASH"
	| "DATABASE_UNAVAILABLE"
	| "NO_MATCHING_MEMBER"
	| "INVALID_CREDENTIALS"
	| "SESSION_ERROR";

export class AuthServiceError extends Error {
	constructor(
		message: string,
		public readonly code: AuthServiceErrorCode,
		public readonly logs: string[] = [],
	) {
		super(message);
		this.name = "AuthServiceError";
	}
}

export type ValidateCredentialsResult = {
	member: MemberModel;
	memberRecord: MemberRecord;
};

export type LoginWithPasswordResult = {
	member: MemberModel;
	session: Session;
	memberRecord: MemberRecord;
};

export class AuthService {
	constructor(private readonly event: H3Event<EventHandlerRequest>) {}

	/**
	 * Validate member login credentials.
	 */
	async validateCredentials(
		username: string,
		password: string,
		logs: string[] = [],
	): Promise<ValidateCredentialsResult> {
		const salt = useRuntimeConfig().private.auth.pass_salt;
		const passwordHash = await GeneratePasswordHash(password.trim(), salt);
		logs.push("Computed hash");
		if (!passwordHash) {
			throw new AuthServiceError("Invalid password", "INVALID_PASSWORD_HASH", logs);
		}

		const supabase = await GetSupabaseAdminClient(this.event);
		if (!supabase) {
			throw new AuthServiceError("Database unavailable", "DATABASE_UNAVAILABLE", logs);
		}

		const candidates = await this.findCandidatesByUsername(username.trim(), supabase, logs);
		const uniqueCandidates = this.deduplicateCandidates(candidates);
		logs.push(`Candidates: ${uniqueCandidates.length}`);

		const matched = uniqueCandidates.find((candidate) => candidate.password_hash === passwordHash);
		if (!matched) {
			logs.push("Password mismatch for all candidates");
			throw new AuthServiceError("Invalid login", "INVALID_CREDENTIALS", logs);
		}

		const memberModel = memberFromRecord(matched);
		return { member: memberModel, memberRecord: matched };
	}

	async loginWithPassword(username: string, password: string, logs: string[] = []): Promise<LoginWithPasswordResult> {
		const { member, memberRecord } = await this.validateCredentials(username, password, logs);
		const session = await this.createSupabaseSession(member, logs);
		if (!session) {
			throw new AuthServiceError("Auth session error", "SESSION_ERROR", logs);
		}
		return { member, session, memberRecord };
	}

	/**
	 * Find potential member records matching the input against login, email, or first+last name
	 */
	private async findCandidatesByUsername(
		username: string,
		supabase: SupabaseClientType,
		logs: string[],
	): Promise<MemberRecord[]> {
		const usernameLower = username.toLowerCase();
		const parts = usernameLower.split(/\s+/).filter(Boolean);
		const first = parts[0] || "";
		const last = parts.length > 1 ? parts[parts.length - 1] : "";

		const candidates: MemberRecord[] = [];
		const { data: byLoginEmail, error: loginEmailErr } = await supabase
			.schema("coderdojo")
			.from("members")
			.select("*")
			.or(`login.eq.${usernameLower},email.eq.${usernameLower}`)
			.eq("deleted", false);
		if (loginEmailErr) {
			logs.push(`Login/email query error: ${loginEmailErr.message}`);
		}
		if (byLoginEmail) {
			candidates.push(...(byLoginEmail as MemberRecord[]));
		}

		if (candidates.length === 0 && first && last) {
			const { data: byName, error: nameErr } = await supabase
				.schema("coderdojo")
				.from("members")
				.select("*")
				.ilike("name_first", first)
				.ilike("name_last", last)
				.eq("deleted", false);
			if (nameErr) {
				logs.push(`Name query error: ${nameErr.message}`);
			}
			if (byName) {
				candidates.push(...(byName as MemberRecord[]));
			}
		}

		if (candidates.length === 0) {
			logs.push("No member candidate");
			throw new AuthServiceError("Invalid login", "NO_MATCHING_MEMBER", logs);
		}

		return candidates;
	}

	/**
	 * Given a list of member records, deduplicate by id (case-insensitive)
	 */
	private deduplicateCandidates(candidates: MemberRecord[]): MemberRecord[] {
		const uniqueById = new Map<string, MemberRecord>();
		for (const candidate of candidates) {
			uniqueById.set(String(candidate.id).toLowerCase(), candidate);
		}
		return Array.from(uniqueById.values());
	}

	/**
	 * Create a supabase session for the given member
	 */
	private async createSupabaseSession(member: MemberModel, logs: string[]): Promise<Session | null> {
		const memberEntityLike: MemberSupabaseModel = {
			memberId: member.id,
			isMentor: member.isMentor,
			isNinja: member.isNinja,
			isParent: member.isParent,
			nameFirst: member.nameFirst,
			nameLast: member.nameLast,
		};
		logs.push(`Logging into supabase for ${JSON.stringify({ memberEntityLike })}`);
		const auth = await LoginToSupabase(this.event, memberEntityLike, logs);
		if (!auth || !auth.session) {
			throw new AuthServiceError("Auth session error", "SESSION_ERROR", logs);
		}
		return auth.session;
	}
}
