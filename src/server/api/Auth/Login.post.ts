import { createClient, Session } from "@supabase/supabase-js";
import { defineEventHandler, readBody, useRuntimeConfig } from "#imports";
import {
	AuthTokenResponse,
	AuthTokenResponsePassword,
} from "@supabase/gotrue-js";

// Define interfaces for the request body and query parameters
type RequestBody = {
	username: string;
	password: string;
};

type ResponseBody = {
	session: Session | null;
};

/**
 * POST: /api/Auth/Login
 */
export default defineEventHandler(
	async (event): Promise<ApiResponse<ResponseBody>> => {
		const { req } = event.node;

		const { username, password } = await readBody<RequestBody>(event);

		const data = await authenticateUser(username, password);

		const config = useRuntimeConfig();
		// const supabaseUrl = config.public.supabase.url;
		// const supabaseServiceRoleKey = config.private.supabase.password;

		return {
			success: true,
			data: {
				session: data?.session ?? null,
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
