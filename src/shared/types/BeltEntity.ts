/**
 * Postgres Belt Entity
 */
export type BeltEntity = {
	id: string;
	deleted: boolean;
	color: string;
	hex_code: string | null;
	description: string | null;
	sort_order: number;
};
