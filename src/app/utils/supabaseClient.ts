import { createClient, SupabaseClient } from "@supabase/supabase-js";

const config = useRuntimeConfig();

const supabaseUrl: string = config.public.supabase.url;
const supabaseKey: string = config.public.supabase.key;

// ToDo: pass schema name as a parameter
export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseKey);
