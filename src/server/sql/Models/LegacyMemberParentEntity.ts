import { MemberParentEntity } from "~~/server/db/entities";

/**
 * SQL Server Member-Parent Entity
 */
export type LegacyMemberParentEntity = {
	Id: string;
	MemberId: string;
	AdultId: string;
};

export const FromLegacyMemberParentEntity = (
	legacy: LegacyMemberParentEntity,
): MemberParentEntity => {
	return {
		id: legacy.Id,
		memberId: legacy.MemberId,
		parentId: legacy.AdultId,
	};
};

export const FromLegacyMemberParentEntities = (
	legacies: LegacyMemberParentEntity[],
): MemberParentEntity[] => {
	return legacies.map(FromLegacyMemberParentEntity);
};
