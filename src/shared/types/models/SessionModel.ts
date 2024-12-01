/**
 * Session Model
 */
export type SessionModel = {
	id: string;
	createdDate: number;
	endDate: number | null;
	url: string | null;
	topic: string | null;
	adultId: string | null;
	adult2Id: string | null;
	mentorsOnly: boolean;
};
