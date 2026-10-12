import { z } from "zod";
import { DateStringSchema } from "../utils/DateHelpers";
import { coderSessionSchema, sessionHostSchema, sessionJoinUrlSchema } from "./CoderSession";

export type SessionFields = { topic: string; url: string | null; hostId: string; host2Id: string | null; mentorsOnly: boolean };
export const sessionFieldsSchema: z.ZodType<SessionFields> = z.strictObject({
 topic: z.string().trim().min(1).max(200),
 url: z.string().trim().max(2000).pipe(sessionJoinUrlSchema).nullable(),
 hostId: z.uuid(), host2Id: z.uuid().nullable(), mentorsOnly: z.boolean(),
}).refine((value: SessionFields): boolean => value.host2Id === null || value.host2Id !== value.hostId, { path: ["host2Id"], message: "Choose different hosts" });
export const sessionSnapshotSchema = z.strictObject({ topic: z.string().nullable(), url: z.string().nullable(), hostId: z.uuid().nullable(), host2Id: z.uuid().nullable(), mentorsOnly: z.boolean(), sessionDate: DateStringSchema, endsAt: z.number().finite().nullable() });
export type SessionSnapshot = z.infer<typeof sessionSnapshotSchema>;
export const sessionFormSchema = sessionSnapshotSchema.superRefine((value: SessionSnapshot, context: z.RefinementCtx): void => {
 const parsed: z.ZodSafeParseResult<SessionFields> = sessionFieldsSchema.safeParse({ topic: value.topic, url: value.url, hostId: value.hostId, host2Id: value.host2Id, mentorsOnly: value.mentorsOnly });
 if (!parsed.success) for (const issue of parsed.error.issues) context.addIssue({ code: "custom", path: issue.path, message: issue.message });
});
export const managedSessionSchema = coderSessionSchema.extend({ fields: sessionSnapshotSchema });
export type ManagedSession = z.infer<typeof managedSessionSchema>;
export const sessionManagementSchema = z.strictObject({ pods: z.array(managedSessionSchema), hosts: z.array(sessionHostSchema), actorId: z.uuid() });
export type SessionManagement = z.infer<typeof sessionManagementSchema>;
export const sessionUpdateSchema = z.strictObject({ fields: sessionFieldsSchema, expected: sessionSnapshotSchema });
export const sessionDeleteSchema = z.strictObject({ expected: sessionSnapshotSchema });
export type SessionUpdate = z.infer<typeof sessionUpdateSchema>;
export type SessionDelete = z.infer<typeof sessionDeleteSchema>;

/** Extract only the editable pod fields from a full conflict-detection snapshot. */
export function editableSessionFields(snapshot: SessionSnapshot): SessionFields {
 return sessionFieldsSchema.parse({ topic: snapshot.topic, url: snapshot.url, hostId: snapshot.hostId, host2Id: snapshot.host2Id, mentorsOnly: snapshot.mentorsOnly });
}
