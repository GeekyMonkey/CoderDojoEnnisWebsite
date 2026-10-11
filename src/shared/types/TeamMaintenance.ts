import { z } from "zod";
import { TeamModelSchema, type TeamModel } from "./models/TeamModel";

/** Normalize optional user-entered text to null. */
const optionalText = (max: number): z.ZodType<string | null> => z.string().trim().max(max).nullable().transform((value: string | null): string | null => value || null);
export const teamFieldsSchema = z.strictObject({
 teamName: z.string().trim().min(1).max(100),
 goal: optionalText(2000),
 notes: optionalText(4000),
 hexcode: z.string().trim().regex(/^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/).nullable().or(z.literal("")).transform((value: string | null): string | null => value || null),
});
export type TeamFields = z.infer<typeof teamFieldsSchema>;
export const teamSnapshotSchema = TeamModelSchema.pick({ teamName: true, goal: true, notes: true, hexcode: true });
export const teamUpdateSchema = z.strictObject({ fields: teamFieldsSchema, expected: teamSnapshotSchema });
export const teamDeleteSchema = z.strictObject({ expected: teamSnapshotSchema });
export const teamSearchSchema = z.string().trim().max(200);
export const teamIdSchema = z.uuid();
export const teamListSchema = z.array(TeamModelSchema.extend({ id: teamIdSchema }));
export type TeamUpdate = z.infer<typeof teamUpdateSchema>;
export type TeamDelete = z.infer<typeof teamDeleteSchema>;
/** Extract the editable team fields without identity or deletion flags. */
export function teamSnapshot(team: TeamModel): TeamFields { return { teamName: team.teamName, goal: team.goal, notes: team.notes, hexcode: team.hexcode }; }
/** Start a team form with nullable optional fields. */
export function newTeam(): TeamFields { return { teamName: "", goal: null, notes: null, hexcode: null }; }
