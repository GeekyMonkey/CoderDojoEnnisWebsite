/** biome-ignore-all lint/style/noNonNullAssertion: <explanation> */
import {
	type AuthError,
	createClient,
	type Session,
	type User,
	type WeakPassword,
} from "@supabase/supabase-js";
import CryptoJS from "crypto-js";
import hasher from "crypto-js/sha256";
// import { GetSupabaseAdminClient } from "../db/DatabaseClient"; // Using local admin client to avoid divergence
import type { EventHandlerRequest, H3Event } from "h3";
import type {
	MemberModel,
	MemberSupabaseModel,
} from "#shared/types/models/MemberModel";
import { ErrorToString } from "#shared/utils/ErrorHelpers";
import { useLogger } from "#shared/utils/Logger";

const log = useLogger("authUtils");

/**
 * Generate a password hash
 */
export const GeneratePasswordHash = async (
	password: string,
	salt: string,
): Promise<string | null> => {
	if (!password) {
		return null;
	}
	const passClean = (password || "").toLowerCase().trim();
	const toHash = `${passClean}-${salt}`;
	log.info("toHash", { toHash });

	const hash = hasher(toHash);
	const hash64: string = hash.toString(CryptoJS.enc.Hex);
	// log.info("hash64", { hash64 });

	const base64String = hash64
		.replace(/\+/g, "-")
		.replace(/\//g, "_")
		.replace(/=+$/, "");
	log.info("hashed", { base64String });

	return base64String;
};

/**
 * Check if the runtime is Cloudflare
 */
export const IsCloudflare = (): boolean => {
	return useRuntimeConfig().public.environment.runtime === "cloudflare";
};

/**
 * Set supabase user metadata
 */
export const SetSupabaseUserMetadata = async (
	member: Partial<MemberModel>,
) => {};

/**
 * Generate a Supabase email address for a member
 */
export const GenerateSupabaseEmailAddressForMember = (
	member: MemberSupabaseModel,
): string => {
	return `${member.memberId}@coderdojoennis.com`;
};

/**
 * Generate Supabase user metadata for a member
 */
export const GenerateSupabaseUserMetaForMember = (
	member: MemberSupabaseModel,
): SupabaseUserMetaType => {
	return {
		memberId: member.memberId,
		isMentor: member.isMentor,
		isNinja: member.isNinja,
		isParent: member.isParent,
		nameFirst: member.nameFirst ?? "",
		nameLast: member.nameLast ?? "",
	};
};

/**
 * Check if two Supabase metadata objects are the same
 */
export const IsSupabaseMetaSame = (
	meta1: SupabaseUserMetaType | null,
	meta2: SupabaseUserMetaType | null,
): boolean => {
	return (
		meta1 != null &&
		meta2 != null &&
		meta1.memberId === meta2.memberId &&
		meta1.isMentor === meta2.isMentor &&
		meta1.isNinja === meta2.isNinja &&
		meta1.isParent === meta2.isParent &&
		meta1.nameFirst === meta2.nameFirst &&
		meta1.nameLast === meta2.nameLast
	);
};

/**
 * Member authenticated, now login to Supabase
 */
export async function LoginToSupabase(
	event: H3Event<EventHandlerRequest>,
	member: MemberSupabaseModel,
	logs: string[],
): Promise<any | null> {
	try {
		// Get Supabase configuration from runtime config
		const config = useRuntimeConfig();
		const supabase = await CreateSupabaseAdminClient();

		const supabaseEmail = GenerateSupabaseEmailAddressForMember(member);
		logs.push(`Supabase email: ${supabaseEmail}`);

		const supabasePass = await GeneratePasswordHash(
			String(member.memberId),
			config.private.auth.pass_salt,
		)!;
		if (!supabasePass) {
			logs.push("Error generating password hash");
			return null;
		}
		// (debug removed) Avoid logging supabasePass

		// Try to sign in with the password
		let authTokenResponse: {
			user: User | null;
			session: Session | null;
			weakPassword?: WeakPassword | null | undefined;
		} | null = null;
		let error: AuthError | null = null;
		try {
			logs.push(`Attempting sign in to supabase for ${supabaseEmail}`);

			const signInResponse = await supabase.auth.signInWithPassword({
				email: supabaseEmail,
				password: supabasePass,
			});

			logs.push(`Sign in response: ${JSON.stringify(signInResponse)}`);
			authTokenResponse = signInResponse.data;
			error = signInResponse.error;
			if (error) {
				logs.push(`Sign in error: ${JSON.stringify(error)}`);
				throw error;
			}
		} catch (_error) {
			// Attempt cleanup & admin-based creation (email auto-confirmed)
			const oldUser = await FindSupabaseUserByEmail(supabaseEmail);
			if (oldUser) {
				logs.push(
					`Deleting existing Supabase user before admin create: ${oldUser.id}`,
				);
				await supabase.auth.admin.deleteUser(oldUser.id);
			}
			logs.push(`Admin create user: ${supabaseEmail}`);
			const createRes = await supabase.auth.admin.createUser({
				email: supabaseEmail,
				email_confirm: true,
				password: supabasePass,
				user_metadata: GenerateSupabaseUserMetaForMember(member),
			});
			if (createRes.error) {
				logs.push(`Admin create error: ${JSON.stringify(createRes.error)}`);
				throw createRes.error;
			}
			// Explicit sign-in after admin creation (admin.createUser does not return a session)
			const signInResponse = await supabase.auth.signInWithPassword({
				email: supabaseEmail,
				password: supabasePass,
			});
			logs.push(
				"Post-create sign in response: " +
					JSON.stringify({
						status: signInResponse.error?.status,
						hasSession: !!signInResponse.data.session,
					}),
			);
			authTokenResponse = signInResponse.data;
			if (signInResponse.error) {
				logs.push(
					`Post-create sign in error: ${JSON.stringify(signInResponse.error)}`,
				);
				throw signInResponse.error;
			}
		}

		// Now that i have the auth token, i can use it to authenticate the user
		let user: User | null = null;
		let session: Session | null = null;
		if (authTokenResponse) {
			user = authTokenResponse.user;
			session = authTokenResponse.session;
		}
		log.info("User authenticated:", { user, session });

		// Update the user metadata if it changed, or if it's a new user
		if (user) {
			UpdateSupabaseUserMetadata(member, user);
		}

		return authTokenResponse;
	} catch (error) {
		logs.push(`LoginToSupabase error: ${JSON.stringify(ErrorToString(error))}`);
		log.error("Error generating JWT:", { logs });
		return null;
	}
}

/**
 * Update the metadata values on the Supabase user based on the member values IF they are different
 */
async function UpdateSupabaseUserMetadata(
	member: MemberSupabaseModel,
	user: User | null,
): Promise<void> {
	const supabase_meta = GenerateSupabaseUserMetaForMember(member);
	const userToUpdate =
		user ||
		(await FindSupabaseUserByEmail(
			GenerateSupabaseEmailAddressForMember(member),
		));

	if (
		userToUpdate != null &&
		!IsSupabaseMetaSame(userToUpdate.user_metadata, supabase_meta)
	) {
		const supabase = await CreateSupabaseAdminClient();
		await supabase.auth.admin.updateUserById(userToUpdate.id, {
			user_metadata: supabase_meta,
		});
	}
}

/**
 * Find a Supabase user by email
 */
async function FindSupabaseUserByEmail(email: string): Promise<User | null> {
	// Supabase JS v2 removed auth.api.getUserByEmail; emulate via admin.listUsers pagination
	const supabase = await CreateSupabaseAdminClient();
	const target = email.toLowerCase();
	let page = 1;
	const perPage = 100;
	try {
		while (true) {
			const { data, error } = await supabase.auth.admin.listUsers({
				page,
				perPage,
			});
			if (error) {
				log.error("listUsers error", { error, page });
				return null;
			}
			const match = (data.users as User[]).find(
				(u: User) => (u.email || "").toLowerCase() === target,
			);
			if (match) {
				return match;
			}
			if (data.users.length < perPage) {
				break; // last page
			}
			page++;
		}
		return null;
	} catch (err) {
		log.error("Error scanning users for email", { err });
		return null;
	}
}

/**
 * Create a Supabase admin client
 */
async function CreateSupabaseAdminClient(): Promise<any> {
	const config = useRuntimeConfig();
	const supabaseUrl =
		config.public.supabase?.url ||
		process.env.NUXT_PUBLIC_SUPABASE_URL ||
		process.env.NUXT_SUPABASE_URL;
	const serviceRoleKey =
		process.env.SUPABASE_SERVICE_ROLE_KEY ||
		config.private.supabase.key_private ||
		process.env.NUXT_SUPABASE_KEY_PRIVATE;
	if (!supabaseUrl) {
		throw new Error("Supabase URL not configured");
	}
	if (!serviceRoleKey) {
		log.error(
			"Service role key missing (set SUPABASE_SERVICE_ROLE_KEY or NUXT_SUPABASE_KEY_PRIVATE)",
		);
		throw new Error("Supabase service role key missing");
	}
	return createClient(supabaseUrl, serviceRoleKey, {
		auth: { persistSession: false, autoRefreshToken: false },
	});
}
