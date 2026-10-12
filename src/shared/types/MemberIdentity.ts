import { z } from "zod";

export const memberIdentitySchema = z.strictObject({ id: z.uuid(), isMentor: z.boolean(), isParent: z.boolean(), isNinja: z.boolean() });
export type MemberIdentity = z.infer<typeof memberIdentitySchema>;
