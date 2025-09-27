	import type { Session } from "@supabase/supabase-js";
	import { defineEventHandler, readBody, useRuntimeConfig } from "#imports";
	import type { ApiResponse } from "~~/shared/types/ApiResponse";
	import { GeneratePasswordHash, LoginToSupabase } from "~~/server/utils/authUtils";
	import { GetSupabaseAdminClient } from "~~/server/db/DatabaseClient";
	import { memberFromRecord, MemberSupabaseModel, type MemberModel } from "~~/shared/types/models/MemberModel";

	type RequestBody = { username: string; password: string };
	type ResponseBody = { member: MemberModel | null; session: Session | null };

	/**
	 * POST: /api/Auth/Login
	 * Accepts username (login/email or first+last) and password, validates against members table.
	 * Passwords stored as deterministic hash (GeneratePasswordHash). Members with deleted=true are excluded.
	 */
	export default defineEventHandler(async (event): Promise<ApiResponse<ResponseBody>> => {
		const logs: string[] = [];
		try {
			const { username, password } = await readBody<RequestBody>(event);
			if (!username || !password) {
				return { success: false, error: "Username and password required", logs };
			}
			const runtime = useRuntimeConfig();
			const salt = runtime.private.auth.pass_salt;
			const passwordHash = await GeneratePasswordHash(password.trim(), salt);
			logs.push("Computed hash");
			if (!passwordHash) {
				return { success: false, error: "Invalid password", logs };
			}

			const supabase = await GetSupabaseAdminClient(event);
			if (!supabase) {
				return { success: false, error: "Database unavailable", logs };
			}

			const usernameLower = username.trim().toLowerCase();
			const parts = usernameLower.split(/\s+/).filter(Boolean);
			const first = parts[0] || "";
			const last = parts.length > 1 ? parts[parts.length - 1] : "";

			// Build OR match: login, email, (first AND last)
			// Supabase JS query builder doesn't support grouped OR with AND directly; do multi-query fallback
			// Query 1: login/email match
			const candidates: any[] = [];
			const { data: byLoginEmail, error: loginEmailErr } = await supabase
				.schema("coderdojo")
				.from("members")
				.select("*")
				.or(`login.eq.${usernameLower},email.eq.${usernameLower}`)
				.eq("deleted", false);
			if (loginEmailErr) logs.push("Login/email query error: " + loginEmailErr.message);
			if (byLoginEmail) candidates.push(...byLoginEmail);

			// Query 2: first/last name (case-insensitive) if both provided and nothing found yet
			if (candidates.length === 0 && first && last) {
				const { data: byName, error: nameErr } = await supabase
					.schema("coderdojo")
					.from("members")
					.select("*")
					.ilike("name_first", first)
					.ilike("name_last", last)
					.eq("deleted", false);
				if (nameErr) logs.push("Name query error: " + nameErr.message);
				if (byName) candidates.push(...byName);
			}

			if (candidates.length === 0) {
				logs.push("No member candidate");
				return { success: false, error: "Invalid login", logs };
			}

			// Deduplicate by id
			const uniqueById = new Map<string, any>();
			for (const c of candidates) uniqueById.set(String(c.id).toLowerCase(), c);
			const uniqueCandidates = Array.from(uniqueById.values());
			logs.push(`Candidates: ${uniqueCandidates.length}`);

			// Match password hash
			const matched = uniqueCandidates.find(c => c.password_hash === passwordHash);
			if (!matched) {
				logs.push("Password mismatch for all candidates");
				return { success: false, error: "Invalid login", logs };
			}

			const memberModel = memberFromRecord(matched);
			// Reuse legacy Supabase login flow (ID-derived supabase password) to obtain a session
			// Need a pseudo MemberEntity; adapt fields expected by LoginToSupabase
			const memberEntityLike: MemberSupabaseModel = {
				memberId: memberModel.id,
				isMentor: memberModel.isMentor,
				isNinja: memberModel.isNinja,
				isParent: memberModel.isParent,
				nameFirst: memberModel.nameFirst,
				nameLast: memberModel.nameLast,
			};
			logs.push("Logging into supabase for " + JSON.stringify({ memberEntityLike }));
			const auth = await LoginToSupabase(event, memberEntityLike, logs);
			if (!auth || !auth.session) {
				return { success: false, error: "Auth session error", logs };
			}

			return {
				success: true,
				data: { member: memberModel, session: auth.session },
				logs,
			};
		} catch (err: any) {
			return { success: false, error: "[Login] POST error: " + err.message, logs: [err.message] };
		}
	});
