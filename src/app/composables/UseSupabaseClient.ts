import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { PostgrestClient } from "@supabase/postgrest-js";

// Singleton values
let supabaseClient: SupabaseClient;
let coderdojoData: PostgrestClient<any, "coderdojo", any>;

/**
 * Supabase Client Composable
 */
export const UseSupabaseClient = (tables: string[] = ["teams"]) => {
	const config = useRuntimeConfig();

	if (!supabaseClient || !coderdojoData) {
		const supabaseUrl: string =
			config.public.supabase.url ||
			process.env.NUXT_SUPABASE_URL ||
			process.env.SUPABASE_URL ||
			"?";
		const supabaseKey: string =
			config.public.supabase.key ||
			process.env.NUXT_SUPABASE_KEY ||
			process.env.SUPABASE_KEY ||
			"?";

		// Get a Supabase client & coderdojo schema
		supabaseClient = createClient(supabaseUrl, supabaseKey);
		coderdojoData = supabaseClient.schema("coderdojo");
	}

	return {
		coderdojoData,
		supabaseClient,
	};
};
