import hasher from "crypto-js/sha256";
import CryptoJS from "crypto-js";
import { MemberEntity } from "../db/entities";
import {
	AuthError,
	createClient,
	Session,
	User,
	WeakPassword,
} from "@supabase/supabase-js";

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
	console.log("toHash", toHash);

	const hash = hasher(toHash);
	const hash64: string = hash.toString(CryptoJS.enc.Hex);
	// console.log("hash64", hash64);

	const base64String = hash64
		.replace(/\+/g, "-")
		.replace(/\//g, "_")
		.replace(/=+$/, "");
	console.log("hashed", base64String);

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
export const SetSupabaseUserMetadata = async (member: MemberEntity) => {};

/**
 * Generate a Supabase email address for a member
 */
export const GenerateSupabaseEmailAddressForMember = (
	member: MemberEntity,
): string => {
	return `${member.id}@coderdojoennis.com`;
};

/**
 * Generate Supabase user metadata for a member
 */
export const GenerateSupabaseUserMetaForMember = (
	member: MemberEntity,
): SupabaseUserMetaType => {
	return {
		memberId: member.id,
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
	member: MemberEntity,
	logs: string[],
): Promise<any | null> {
	try {
		// Get Supabase configuration from runtime config
		const config = useRuntimeConfig();
		const supabase = CreateSupabaseAdminClient();

		const supabaseEmail = GenerateSupabaseEmailAddressForMember(member);
		logs.push("Supabase email: " + supabaseEmail);

		const supabasePass = await GeneratePasswordHash(
			String(member.id),
			config.private.auth.pass_salt,
		)!;
		if (!supabasePass) {
			logs.push("Error generating password hash");
			return null;
		}

		// Try to sign in with the password
		let authTokenResponse: {
			user: User | null;
			session: Session | null;
			weakPassword?: WeakPassword | null | undefined;
		} | null = null;
		let error: AuthError | null = null;
		try {
			const signInResponse = await supabase.auth.signInWithPassword({
				email: supabaseEmail,
				password: supabasePass,
			});
			logs.push("Sign in response: " + JSON.stringify(signInResponse));
			authTokenResponse = signInResponse.data;
			error = signInResponse.error;
			if (error) {
				logs.push("Sign in error: " + JSON.stringify(error));
				throw error;
			}
		} catch (error) {
			// Delete the old user if it exists so they can be recreated
			const oldUser = await FindSupabaseUserByEmail(supabaseEmail);
			if (oldUser) {
				supabase.auth.admin.deleteUser(oldUser.id);
			}

			// sign in failed, try creating user
			logs.push("Create new supabase user: " + supabaseEmail);
			let signedUp = await supabase.auth.signUp({
				email: supabaseEmail,
				password: supabasePass,
			});
			if (signedUp.error) {
				logs.push(
					"SignUp error: " +
						JSON.stringify({
							error: signedUp.error,
							data: signedUp.data,
						}),
				);
				throw signedUp.error;
			}

			if (signedUp.data.user) {
				if (!signedUp.data.user!.confirmed_at) {
					const now = new Date().toISOString();
					signedUp.data.user.confirmed_at = now;
					signedUp.data.user.email_confirmed_at = now;
				}

				await supabase.auth.updateUser(signedUp.data.user!);
				logs.push("Confirmed new user");
			}

			if (signedUp.data.session) {
				authTokenResponse = signedUp.data;
				error = signedUp.error;
			} else {
				logs.push("Retry sign in");
				const signInResponse = await supabase.auth.signInWithPassword({
					email: supabaseEmail,
					password: supabasePass,
				});
				logs.push(
					"Sign in 2 response: " + JSON.stringify(signInResponse),
				);
				authTokenResponse = signInResponse.data;
				error = signInResponse.error;
				if (error) {
					logs.push("Sign in 2 error: " + JSON.stringify(error));
					throw error;
				}
			}
		}

		// Now that i have the auth token, i can use it to authenticate the user
		let user: User | null = null;
		let session: Session | null = null;
		if (authTokenResponse) {
			user = authTokenResponse.user;
			session = authTokenResponse.session;
		}
		console.log("User authenticated:", { user, session });

		// Update the user metadata if it changed, or if it's a new user
		if (!!user) {
			UpdateSupabaseUserMetadata(member, user);
		}

		return authTokenResponse;
	} catch (error) {
		console.error("Error generating JWT:", error);
		return null;
	}
}

/**
 * Update the metadata values on the Supabase user based on the member values IF they are different
 */
async function UpdateSupabaseUserMetadata(
	member: MemberEntity,
	user: User | null,
): Promise<void> {
	const supabase_meta = GenerateSupabaseUserMetaForMember(member);
	let userToUpdate =
		user ||
		(await FindSupabaseUserByEmail(
			GenerateSupabaseEmailAddressForMember(member),
		));

	if (
		userToUpdate != null &&
		!IsSupabaseMetaSame(userToUpdate.user_metadata, supabase_meta)
	) {
		const supabase = CreateSupabaseAdminClient();
		await supabase.auth.admin.updateUserById(userToUpdate.id, {
			user_metadata: supabase_meta,
		});
	}
}

/**
 * Find a Supabase user by email
 */
async function FindSupabaseUserByEmail(email: string): Promise<User | null> {
	const supabase = CreateSupabaseAdminClient();
	const { data: user, error } = await supabase.auth.api.getUserByEmail(email);
	if (error) {
		console.error("Error finding user by email:", error);
		return null;
	}

	return user;
}

/**
 * Create a Supabase admin client
 */
function CreateSupabaseAdminClient(): any {
	const config = useRuntimeConfig();
	const supabaseUrl = config.public.supabase.url;
	const supabaseServiceRoleKey = config.private.supabase.key_private;
	const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);
	return supabase;
}
