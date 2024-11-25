import { BeltEntity } from "~~/server/db/entities";

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
		hexCode: legacy.HexCode,
		description: legacy.Description,
		sortOrder: legacy.SortOrder,
	};
};

export const FromLegacyBeltEntities = (
	legacies: LegacyBeltEntity[],
): BeltEntity[] => {
	return legacies.map(FromLegacyBeltEntity);
};
