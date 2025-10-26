import type { SupabaseClient } from "@supabase/supabase-js";

// Wrap the Nuxt module client so we have a single source of truth for auth/session.
// Supabase JS v2 client (used by @nuxtjs/supabase) exposes .from() for table queries.
// If you previously relied on .schema('coderdojo'), replace with supabaseClient.from('<table>')
// since all your tables live in that schema already (search_path handles it). If explicit
// schema scoping is ever needed you can use RPC or Postgrest filters directly.
export const UseSupabaseClient = () => {
	const supabaseClient = useSupabaseClient<SupabaseClient>();
	return { supabaseClient };
};
