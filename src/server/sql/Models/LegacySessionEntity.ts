/**
 * SQL Server Session Entity
 */
export type LegacySessionEntity = {
	Id: string;
	CreatedDate: number;
	EndDate: number | null;
	Url: string | null;
	Topic: string | null;
	AdultId: string | null;
	Adult2Id: string | null;
	MentorsOnly: boolean;
};

export const FromLegacySessionEntity = (
	legacy: LegacySessionEntity,
): SessionEntity => {
	return {
		id: legacy.Id,
		created_date: legacy.CreatedDate,
		end_date: legacy.EndDate,
		url: legacy.Url,
		topic: legacy.Topic,
		adult_id: legacy.AdultId,
		adult2_id: legacy.Adult2Id,
		mentors_only: legacy.MentorsOnly,
	};
};

export const FromLegacySessionEntities = (
	legacies: LegacySessionEntity[],
): SessionEntity[] => {
	return legacies.map(FromLegacySessionEntity);
};
