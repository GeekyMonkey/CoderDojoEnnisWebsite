import {
	AuthError,
	createClient,
	Session,
	User,
	WeakPassword,
} from "@supabase/supabase-js";
import { defineEventHandler, readBody, useRuntimeConfig } from "#imports";
import {
	AuthTokenResponse,
	AuthTokenResponsePassword,
} from "@supabase/gotrue-js";
import { DrizzleType, UseDrizzle } from "~~/server/db/UseDrizzle";
import { members } from "~~/server/db/schema/schemas";
import { and, eq, ilike, or } from "drizzle-orm";
import { GeneratePasswordHash, MemberEntity } from "~~/server/db/entities";

// Define interfaces for the request body and query parameters
type RequestBody = {
	username: string;
	password: string;
};

type ResponseBody = {
	session: Session | null;
	logs: string[];
};

/**
 * POST: /api/Auth/Login
 */
export default defineEventHandler(
	async (event): Promise<ApiResponse<ResponseBody>> => {
		const { req } = event.node;

		const { username, password } = await readBody<RequestBody>(event);

		const logs: string[] = [];

		const member = await findMember(username, password, logs);

		let user = null;
		if (member != null) {
			user = await loginToSupabase(member, logs);
		}

		return {
			success: true,
			data: {
				session: user?.session ?? null,
				logs,
			},
		};
	},
);

/**
 * Find a member with a matching username and password
 */
async function findMember(
	username: string,
	password: string,
	logs: string[],
): Promise<MemberEntity | null> {
	const db: DrizzleType = UseDrizzle();

	password = password.trim();
	const salt = process.env.PASS_SALT || "_Salty!_";
	const passwordHash: string | null = GeneratePasswordHash(password, salt);
	logs.push("Hash: " + passwordHash);

	const usernameLower = username.trim().toLowerCase();
	const [usernameFirst, usernameLast] = usernameLower.split(" ");
	logs.push("Username: " + usernameLower);
	logs.push("First name: " + usernameFirst);
	logs.push("Last name: " + usernameLast);

	const memberLoginQuery = db
		.select()
		.from(members)
		.where(
			and(
				eq(members.deleted, false),
				eq(members.passwordHash, passwordHash ?? "_"),
				or(
					ilike(members.login, usernameLower),
					ilike(members.email, usernameLower),
					and(
						ilike(members.nameFirst, usernameFirst),
						ilike(members.nameLast, usernameLast),
					),
				),
			),
		);

	const loginMatches = await memberLoginQuery.execute();
	if (loginMatches.length === 0) {
		logs.push("member not found");
		return null;
	}

	if (loginMatches.length > 1) {
		logs.push(
			"Error: Multiple members found with the same login: " + username,
		);
	}

	logs.push("member found: " + loginMatches[0].login);

	return loginMatches?.[0] ?? null;
}

/**
 * Member authenticated, now login to Supabase
 */
async function loginToSupabase(
	member: MemberEntity,
	logs: string[],
): Promise<any | null> {
	try {
		// Get Supabase configuration from runtime config
		const config = useRuntimeConfig();
		const supabaseUrl = config.public.supabase.url;
		const supabaseServiceRoleKey = config.private.supabase.password;
		const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

		const supabaseEmail = `${member.id}@coderdojoennis.com`;
		const supabasePass = GeneratePasswordHash(
			String(member.id),
			process.env.PASS_SALT ?? "_Salty!_",
		)!;
		logs.push("Supabase email: " + supabaseEmail);

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
			// sign in failed, try creating user
			logs.push("Create new supabase uer: " + supabaseEmail);
			const signedUp = await supabase.auth.signUp({
				email: supabaseEmail,
				password: supabasePass,
			});
			if (signedUp.error) {
				logs.push("SignUp error: " + signedUp.error.message);
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
		const { user, session } = authTokenResponse;
		console.log("User authenticated:", { user, session });

		return authTokenResponse;
	} catch (error) {
		console.error("Error generating JWT:", error);
		return null;
	}
}
