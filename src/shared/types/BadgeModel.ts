/**
 * Badge Model
 */
export type BadgeModel = {
	id: string;
	deleted: boolean;
	achievement: string | null;
	badgeCategoryId: string | null;
	description: string | null;
};
