import { createClient, Session } from "@supabase/supabase-js";
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

		// const data = await authenticateUser(username, password);

		// const config = useRuntimeConfig();
		// const supabaseUrl = config.public.supabase.url;
		// const supabaseServiceRoleKey = config.private.supabase.password;

		return {
			success: true,
			data: {
				session: null, // data?.session ?? null,
				logs,
			},
			// bi: body.bogusIndex,
			// status: "k",
			// user: data,
			// supabaseUrl,
			// supabaseServiceRoleKey,
			// env: process.env,
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
 * Authenticate login
 */
async function authenticateUser(
	username: string,
	password: string,
): Promise<any | null> {
	try {
		// Get Supabase configuration from runtime config
		const config = useRuntimeConfig();
		const supabaseUrl = config.public.supabase.url;
		const supabaseServiceRoleKey = config.private.supabase.password;

		// Create Supabase client
		const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

		const userId = "cc4c3811-7650-491e-942b-ffd68a6c34a6";
		const { data: authTokenResponse, error } =
			await supabase.auth.signInWithPassword({
				email: "russ@coderdojoennis.com",
				password: "plah",
			});

		if (error) {
			throw error;
		}

		// Now that i have the auth token, i can use it to authenticate the user
		const { user, session } = authTokenResponse;
		console.log("User authenticated:", user, session);

		return authTokenResponse;
	} catch (error) {
		console.error("Error generating JWT:", error);
		return null;
	}
}
