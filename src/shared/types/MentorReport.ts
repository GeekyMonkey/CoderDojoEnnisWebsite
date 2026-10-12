import { z } from "zod";
import { BeltModelSchema } from "./models/BeltModel";

export const ReportKindSchema = z.enum(["belts", "parents", "mentors"]);
export type ReportKind = z.infer<typeof ReportKindSchema>;
export const ReportQuerySchema = z.strictObject({ kind: ReportKindSchema, since: z.iso.date().optional() });
export const ReportRowSchema = z.strictObject({
 id: z.string(), memberId: z.string(), nameFirst: z.string(), nameLast: z.string(),
 email: z.string(), awarded: z.string().nullable(), notes: z.string(), belt: BeltModelSchema.nullable(),
 hasPhoto: z.boolean(), registeredCurrentTerm: z.boolean(),
});
export type ReportRow = z.infer<typeof ReportRowSchema>;

/** Default to the same day two years ago, clamping leap days. */
export function defaultReportSince(): string {
 const date: Date = new Date();
 const month: number = date.getMonth();
 date.setFullYear(date.getFullYear() - 2);
 if (date.getMonth() !== month) date.setDate(0);
 return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}
