import { z } from "zod";
import { DateStringSchema } from "../../utils/DateHelpers";
import type { Database } from "../../../types/supabase";

export type SessionRecord = Database["coderdojo"]["Tables"]["sessions"]["Row"];

export const SessionModelSchema = z.strictObject({
	id: z.string(),
	deleted: z.boolean().default(false),
	sessionDate: DateStringSchema,
	topic: z.string().nullable(),
	mentorsOnly: z.boolean(),
});

export type SessionModel = z.infer<typeof SessionModelSchema>;

export function sessionFromRecord(record: SessionRecord): SessionModel {
	return SessionModelSchema.parse({
		id: record.id,
		deleted: false,
		sessionDate: record.session_date,
		topic: record.topic,
		mentorsOnly: record.mentors_only,
	});
}

export function sessionToRecord(model: SessionModel): SessionRecord {
	return {
		id: model.id,
		session_date: model.sessionDate,
		topic: model.topic,
		mentors_only: model.mentorsOnly,
	} as SessionRecord;
}

export function sessionFromRecords(records: SessionRecord[]): SessionModel[] {
	return records.map(sessionFromRecord);
}

export function sessionToRecords(models: SessionModel[]): SessionRecord[] {
	return models.map(sessionToRecord);
}
