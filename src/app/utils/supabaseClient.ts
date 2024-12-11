import { createClient, SupabaseClient } from "@supabase/supabase-js";

const config = useRuntimeConfig();

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

// ToDo: pass schema name as a parameter
export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseKey);
export const coderdojoData = supabase.schema("coderdojo");
