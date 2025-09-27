import { type SessionModel } from "~~/shared/types/models/SessionModel";
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
): SessionModel => {
	const created = NumberToDate(legacy.CreatedDate);
	const end = NumberToDateOrNull(legacy.EndDate);
	return {
		id: legacy.Id,
		createdDate: created.getTime(),
		endDate: end ? end.getTime() : null,
		url: legacy.Url,
		topic: legacy.Topic,
		adultId: legacy.AdultId,
		adult2Id: legacy.Adult2Id,
		mentorsOnly: legacy.MentorsOnly,
	};
};

export const FromLegacySessionEntities = (
	legacies: LegacySessionEntity[],
): SessionModel[] => {
	return legacies.map(FromLegacySessionEntity);
};
