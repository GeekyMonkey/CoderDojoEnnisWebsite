/**
 * Postgres Badge Category Entity
 */
export type BadgeCategoryEntity = {
	id: string;
	deleted: boolean;
	category_name: string | null;
	category_description: string | null;
};
