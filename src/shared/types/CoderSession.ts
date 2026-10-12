import { z } from "zod";
import { DateStringSchema } from "../utils/DateHelpers";
import { publicMemberSchema } from "./Coder";

export const sessionJoinUrlSchema = z.url().refine((value: string): boolean => {
 try {
  const url: URL = new URL(value);
  return ["https:", "http:"].includes(url.protocol) && !url.username && !url.password;
 } catch { return false; }
}, "An HTTP or HTTPS URL without credentials is required");
export const sessionHostSchema = publicMemberSchema.pick({ id: true, nameFirst: true, nameLast: true, hasPhoto: true, hasAvatar: true, isMentor: true, isNinja: true, isParent: true });
export const coderSessionSchema = z.strictObject({ id: z.uuid(), topic: z.string().nullable(), sessionDate: DateStringSchema, endsAt: z.number().finite().nullable(), url: sessionJoinUrlSchema.nullable(), hosts: z.array(sessionHostSchema).max(2) });
export const coderSessionsSchema = z.array(coderSessionSchema);
export const coderSessionJoinSchema = z.strictObject({ sessionId: z.uuid() });
export const coderSessionJoinedSchema = z.strictObject({ url: sessionJoinUrlSchema, attendanceDate: DateStringSchema });
export type SessionHost = z.infer<typeof sessionHostSchema>;
export type CoderSession = z.infer<typeof coderSessionSchema>;
export type CoderSessionJoin = z.infer<typeof coderSessionJoinSchema>;
export type CoderSessionJoined = z.infer<typeof coderSessionJoinedSchema>;

/** Return a safe external session URL, or null for missing/invalid historical data. */
export function safeSessionUrl(value: string | null): string | null {
 const parsed: ReturnType<typeof sessionJoinUrlSchema.safeParse> = sessionJoinUrlSchema.safeParse(value);
 return parsed.success ? parsed.data : null;
}
