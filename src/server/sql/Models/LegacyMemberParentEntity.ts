import { type MemberParentModel } from "#shared/types/models/MemberParentModel";

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
): MemberParentModel => {
	return {
		id: legacy.Id,
		memberId: legacy.MemberId,
		parentId: legacy.AdultId,
	};
};

export const FromLegacyMemberParentEntities = (
	legacies: LegacyMemberParentEntity[],
): MemberParentModel[] => {
	return legacies.map(FromLegacyMemberParentEntity);
};
