/**
 * Supabase user metadata
 */
export type SupabaseUserMetaType =
	| {
			memberId: string;
			isMentor: boolean;
			isNinja: boolean;
			isParent: boolean;
			nameFirst: string;
			nameLast: string;
	  }
	| Record<string, any>;
