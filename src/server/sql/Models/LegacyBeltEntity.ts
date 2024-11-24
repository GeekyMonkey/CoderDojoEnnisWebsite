/**
 * SQL Server Belt Entity
 */
export type LegacyBeltEntity = {
	Id: string;
	Deleted: boolean;
	Color: string;
	HexCode: string | null;
	Description: string | null;
	SortOrder: number;
};

export const FromLegacyBeltEntity = (legacy: LegacyBeltEntity): BeltEntity => {
	return {
		id: legacy.Id,
		deleted: legacy.Deleted,
		color: legacy.Color,
		hex_code: legacy.HexCode,
		description: legacy.Description,
		sort_order: legacy.SortOrder,
	};
};

export const FromLegacyBeltEntities = (
	legacies: LegacyBeltEntity[],
): BeltEntity[] => {
	return legacies.map(FromLegacyBeltEntity);
};
