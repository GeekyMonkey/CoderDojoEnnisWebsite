/**
 * SQL Server Badge Category Entity
 */
export type LegacyBadgeCategoryEntity = {
	Id: string;
	Deleted: boolean;
	CategoryName: string | null;
	CategoryDescription: string | null;
};

export const FromLegacyBadgeCategoryEntity = (
	legacy: LegacyBadgeCategoryEntity,
): BadgeCategoryEntity => {
	return {
		id: legacy.Id,
		deleted: legacy.Deleted,
		category_name: legacy.CategoryName,
		category_description: legacy.CategoryDescription,
	};
};

export const FromLegacyBadgeCategoryEntities = (
	legacies: LegacyBadgeCategoryEntity[],
): BadgeCategoryEntity[] => {
	return legacies.map(FromLegacyBadgeCategoryEntity);
};
