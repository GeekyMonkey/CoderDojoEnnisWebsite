import { createClient, Session } from "@supabase/supabase-js";
import { defineEventHandler, readBody, useRuntimeConfig } from "#imports";

// Define interfaces for the request body and query parameters
interface RequestBody {
	bogusIndex: number;
}

export default defineEventHandler(
	async (event): Promise<{ session: Session | null }> => {
		const { req } = event.node;

		// Access request body
		const body: RequestBody = await readBody(event);

		const data = await authenticateUser();

		const config = useRuntimeConfig();
		const supabaseUrl = config.public.supabase.url;
		const supabaseServiceRoleKey = config.private.supabase.password;

		return {
			// bi: body.bogusIndex,
			// status: "k",
			session: data?.session ?? null,
			// user: data,
			// supabaseUrl,
			// supabaseServiceRoleKey,
			// env: process.env,
		};
	},
);

async function authenticateUser() {
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
