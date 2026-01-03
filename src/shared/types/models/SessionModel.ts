import { z } from "zod";
import type { Database } from "../../../types/supabase";

export type SessionRecord = Database["coderdojo"]["Tables"]["sessions"]["Row"];

export const SessionModelSchema = z.strictObject({
	id: z.string(),
	createdDate: z.number(),
	endDate: z.number().nullable(),
	url: z.string().nullable(),
	topic: z.string().nullable(),
	adultId: z.string().nullable(),
	adult2Id: z.string().nullable(),
	mentorsOnly: z.boolean(),
});

export type SessionModel = z.infer<typeof SessionModelSchema>;

export function sessionFromRecord(record: SessionRecord): SessionModel {
	return SessionModelSchema.parse({
		id: record.id,
		createdDate: Date.parse(record.created_date),
		endDate: record.end_date ? Date.parse(record.end_date) : null,
		url: record.url,
		topic: record.topic,
		adultId: record.adult_id,
		adult2Id: record.adult2_id,
		mentorsOnly: record.mentors_only,
	});
}

export function sessionToRecord(model: SessionModel): SessionRecord {
	return {
		id: model.id,
		created_date: new Date(model.createdDate).toISOString(),
		end_date: model.endDate ? new Date(model.endDate).toISOString() : null,
		url: model.url,
		topic: model.topic,
		adult_id: model.adultId,
		adult2_id: model.adult2Id,
		mentors_only: model.mentorsOnly,
	} as SessionRecord;
}

export function sessionFromRecords(records: SessionRecord[]): SessionModel[] {
	return records.map(sessionFromRecord);
}

export function sessionToRecords(models: SessionModel[]): SessionRecord[] {
	return models.map(sessionToRecord);
}
