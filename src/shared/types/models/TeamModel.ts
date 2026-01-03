import { z } from "zod";
import type { TeamRecord } from "../../../server/db/TeamsData";

/**
 * Team Model Schema
 */
export const TeamModelSchema = z.strictObject({
	id: z.string(),
	deleted: z.boolean(),
	goal: z.string().nullable(),
	hexcode: z.string().nullable(),
	notes: z.string().nullable(),
	teamName: z.string(),
});

/**
 * Team Model
 */
export type TeamModel = z.infer<typeof TeamModelSchema>;

/**
 * Convert TeamRecord to TeamModel (validated)
 */

export function teamFromRecord(record: TeamRecord): TeamModel {
	return TeamModelSchema.parse({
		id: String(record.id),
		deleted: Boolean(record.deleted),
		goal: record.goal ?? null,
		hexcode: record.hexcode ?? null,
		notes: record.notes ?? null,
		teamName: record.team_name,
	});
}

/**
 * Convert TeamModel to TeamRecord
 */
export function teamToRecord(model: TeamModel): TeamRecord {
	return {
		id: model.id,
		deleted: model.deleted,
		goal: model.goal,
		hexcode: model.hexcode,
		notes: model.notes,
		team_name: model.teamName,
	} as TeamRecord;
}

/**
 * Convert array of TeamRecord to array of TeamModel
 */
export function teamFromRecords(records: TeamRecord[]): TeamModel[] {
	return records.map(teamFromRecord);
}

/**
 * Convert array of TeamModel to array of TeamRecord
 */
export function teamToRecords(models: TeamModel[]): TeamRecord[] {
	return models.map(teamToRecord);
}
