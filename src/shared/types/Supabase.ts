import type { MemberSupabaseModel } from "./models/MemberModel";

/**
 * Supabase user metadata
 */
export type SupabaseUserMetaType =
	| MemberSupabaseModel
	| Record<string, any>;
