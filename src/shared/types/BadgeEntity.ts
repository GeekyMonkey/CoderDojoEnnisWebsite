/**
 * Postgres Badge Entity
 */
export type BadgeEntity = {
	id: string;
	deleted: boolean;
	achievement: string;
	badge_category_id: string | null;
	description: string | null;
};
