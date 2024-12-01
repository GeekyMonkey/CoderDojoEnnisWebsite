import { SessionEntity } from "~~/server/db/entities";
import { NumberToDate, NumberToDateOrNull } from "~~/shared/utils/DateHelpers";

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
		createdDate: NumberToDate(legacy.CreatedDate),
		endDate: NumberToDateOrNull(legacy.EndDate),
		url: legacy.Url,
		topic: legacy.Topic,
		adultId: legacy.AdultId,
		adult2Id: legacy.Adult2Id,
		mentorsOnly: legacy.MentorsOnly,
	};
};

export const FromLegacySessionEntities = (
	legacies: LegacySessionEntity[],
): SessionEntity[] => {
	return legacies.map(FromLegacySessionEntity);
};
