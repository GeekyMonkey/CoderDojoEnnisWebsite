import { Base64Encode } from "~~/shared/utils/StringHelpers";

/**
 * Member Model
 */
export type MemberModel = {
	id: string;
	deleted: boolean;
	birthYear: number | null;
	email: string | null;
	fingerprintId: number | null;
	gardaVetted: boolean;
	githubLogin: string | null;
	goalLongTerm: string | null;
	goalShortTerm: string | null;
	isMentor: boolean;
	isNinja: boolean;
	isParent: boolean;
	login: string | null;
	loginDate: number | null;
	loginDatePrevious: number | null;
	nameFirst: string | null;
	nameLast: string | null;
	passwordHash: string | null;
	phone: string | null;
	registeredCurrentTerm: boolean;
	scratchName: string | null;
	teamId: string | null;
	xboxGamertag: string | null;
};

/**
 * Base64 encode the password hash for storage in Supabase
 */
export const EncodePasswordHash = (
	passwordHash: string | null,
): string | null => {
	if (passwordHash === null) {
		return null;
	}
	try {
		const encoded: string = Base64Encode(passwordHash);
		return encoded;
	} catch (err) {
		throw new Error(
			`Error encoding password hash for ${passwordHash}: ${err}`,
		);
	}
};
