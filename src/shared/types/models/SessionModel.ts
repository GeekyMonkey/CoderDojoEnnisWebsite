import { sessionTypeSchema } from "#shared/types/MemberCalendar";
import { z } from "zod";
import { DateStringSchema } from "../../utils/DateHelpers";
import type { Database } from "../../../types/supabase";

export type SessionRecord = Database["coderdojo"]["Tables"]["sessions"]["Row"];

export const SessionModelSchema = z.strictObject({
	id: z.string(),
	deleted: z.boolean().default(false),
	sessionDate: DateStringSchema,
	topic: z.string().nullable(),
	sessionType: sessionTypeSchema,
});

export type SessionModel = z.infer<typeof SessionModelSchema>;

export function sessionFromRecord(record: SessionRecord): SessionModel {
	return SessionModelSchema.parse({
		id: record.id,
		deleted: record.deleted,
		sessionDate: record.session_date,
		topic: record.topic,
		sessionType: record.session_type,
	});
}

export function sessionToRecord(model: SessionModel): SessionRecord {
	return {
		id: model.id,
		session_date: model.sessionDate,
		topic: model.topic,
		session_type: model.sessionType,
	} as SessionRecord;
}

export function sessionFromRecords(records: SessionRecord[]): SessionModel[] {
	return records.map(sessionFromRecord);
}

export function sessionToRecords(models: SessionModel[]): SessionRecord[] {
	return models.map(sessionToRecord);
}
