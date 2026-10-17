import { z } from "zod";
import { MemberModelSchema, type MemberModel } from "./models/MemberModel";
export const MERGE_FIELDS = ["nameFirst", "nameLast", "fingerprintId", "nfcTag", "gardaVetted", "registeredCurrentTerm", "birthYear", "email", "phone", "githubLogin", "scratchName", "xboxGamertag", "teamId", "goalShortTerm", "goalLongTerm"] as const;
export type MergeField = typeof MERGE_FIELDS[number];
export type MergeChoices = Record<MergeField, "keep" | "duplicate">;
export type MergeImageSource = "keep" | "duplicate" | "none";
export type MergeImages = { photo: MergeImageSource; avatar: MergeImageSource };
export type MemberMerge = { duplicateId: string; expectedKeep: MemberModel; expectedDuplicate: MemberModel; choices: MergeChoices; images: MergeImages };
export const MemberMergeSchema: z.ZodType<MemberMerge> = z.strictObject({ duplicateId: z.uuid(), expectedKeep: MemberModelSchema, expectedDuplicate: MemberModelSchema, images: z.strictObject({ photo: z.enum(["keep", "duplicate", "none"]), avatar: z.enum(["keep", "duplicate", "none"]) }), choices: z.strictObject({ nameFirst: z.enum(["keep", "duplicate"]), nameLast: z.enum(["keep", "duplicate"]), fingerprintId: z.enum(["keep", "duplicate"]), nfcTag: z.enum(["keep", "duplicate"]), gardaVetted: z.enum(["keep", "duplicate"]), registeredCurrentTerm: z.enum(["keep", "duplicate"]), birthYear: z.enum(["keep", "duplicate"]), email: z.enum(["keep", "duplicate"]), phone: z.enum(["keep", "duplicate"]), githubLogin: z.enum(["keep", "duplicate"]), scratchName: z.enum(["keep", "duplicate"]), xboxGamertag: z.enum(["keep", "duplicate"]), teamId: z.enum(["keep", "duplicate"]), goalShortTerm: z.enum(["keep", "duplicate"]), goalLongTerm: z.enum(["keep", "duplicate"]) }) }).refine((value: MemberMerge): boolean => value.duplicateId === value.expectedDuplicate.id && value.expectedKeep.id !== value.duplicateId).refine((value: MemberMerge): boolean => (["photo", "avatar"] as const).every((slot: "photo" | "avatar"): boolean => {
 const key: "hasPhoto" | "hasAvatar" = slot === "photo" ? "hasPhoto" : "hasAvatar";
 const source: MergeImageSource = value.images[slot];
 return source === "none" ? !value.expectedKeep[key] && !value.expectedDuplicate[key] : (source === "keep" ? value.expectedKeep[key] : value.expectedDuplicate[key]);
}));

export type MergeSource = "keep" | "duplicate";
/** Require review of every discrepancy and bind credentials to the selected account. */
export function reviewedMemberMerge(keep: MemberModel, duplicate: MemberModel, survivor: MergeSource | null, reviewed: Partial<MergeChoices>, reviewedImages: Partial<MergeImages> = {}): MemberMerge | null {
 if (!survivor) return null;
 const choices: Partial<MergeChoices> = {};
 for (const field of MERGE_FIELDS) {
  const source: MergeSource | undefined = keep[field] === duplicate[field] ? "keep" : reviewed[field];
  if (!source) return null;
  choices[field] = survivor === "keep" ? source : source === "keep" ? "duplicate" : "keep";
 }
 const images: Partial<MergeImages> = {};
 for (const slot of ["photo", "avatar"] as const) {
  const key: "hasPhoto" | "hasAvatar" = slot === "photo" ? "hasPhoto" : "hasAvatar";
  const source: MergeImageSource | undefined = keep[key] && duplicate[key] ? reviewedImages[slot] : keep[key] ? "keep" : duplicate[key] ? "duplicate" : "none";
  if (!source || (source === "none" && (keep[key] || duplicate[key]))) return null;
  images[slot] = source === "none" || survivor === "keep" ? source : source === "keep" ? "duplicate" : "keep";
 }
 return MemberMergeSchema.parse({ images, duplicateId: survivor === "keep" ? duplicate.id : keep.id, expectedKeep: survivor === "keep" ? keep : duplicate, expectedDuplicate: survivor === "keep" ? duplicate : keep, choices });
}
