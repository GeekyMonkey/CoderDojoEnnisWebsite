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
		member_id: legacy.MemberId,
		parent_id: legacy.AdultId,
	};
};

export const FromLegacyMemberParentEntities = (
	legacies: LegacyMemberParentEntity[],
): MemberParentEntity[] => {
	return legacies.map(FromLegacyMemberParentEntity);
};
