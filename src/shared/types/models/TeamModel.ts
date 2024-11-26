/**
 * Team Model
 */
export type TeamModel = {
	id: string;
	deleted: boolean;
	goal: string | null;
	hexcode: string | null;
	notes: string | null;
	teamName: string;
};
