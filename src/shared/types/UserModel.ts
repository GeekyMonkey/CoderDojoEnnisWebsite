import type { User } from "@supabase/supabase-js";

/**
 * Client side user state
 */
export type UserModel = {
	Member: MemberModel | null;
	SupabaseUser: User | null;
};

/**
 * Not yet logged in
 */
export const GetAnonymousUser = (): UserModel => ({
	Member: null,
	SupabaseUser: null,
});
