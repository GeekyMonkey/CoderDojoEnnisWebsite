import { z } from "zod";
import { MemberModelSchema, type MemberModel } from "./models/MemberModel";
export const MERGE_FIELDS = ["birthYear", "email", "phone", "githubLogin", "scratchName", "xboxGamertag", "teamId", "goalShortTerm", "goalLongTerm"] as const;
export type MergeField = typeof MERGE_FIELDS[number];
export type MergeChoices = Record<MergeField, "keep" | "duplicate">;
export type MemberMerge = { duplicateId: string; expectedKeep: MemberModel; expectedDuplicate: MemberModel; choices: MergeChoices };
export const MemberMergeSchema: z.ZodType<MemberMerge> = z.strictObject({ duplicateId: z.uuid(), expectedKeep: MemberModelSchema, expectedDuplicate: MemberModelSchema, choices: z.strictObject({ birthYear: z.enum(["keep", "duplicate"]), email: z.enum(["keep", "duplicate"]), phone: z.enum(["keep", "duplicate"]), githubLogin: z.enum(["keep", "duplicate"]), scratchName: z.enum(["keep", "duplicate"]), xboxGamertag: z.enum(["keep", "duplicate"]), teamId: z.enum(["keep", "duplicate"]), goalShortTerm: z.enum(["keep", "duplicate"]), goalLongTerm: z.enum(["keep", "duplicate"]) }) }).refine((value: MemberMerge): boolean => value.duplicateId === value.expectedDuplicate.id && value.expectedKeep.id !== value.duplicateId);
