import { z } from "zod";

export const dataMaintenanceActionSchema = z.enum(["members", "registrations"]);
export const dataMaintenanceRequestSchema = z.strictObject({
 action: dataMaintenanceActionSchema,
 revision: z.string().regex(/^[0-9a-f]{32}$/),
});
export const dataMaintenanceReportSchema = z.strictObject({
 action: dataMaintenanceActionSchema,
 cutoff: z.iso.date(),
 revision: z.string().regex(/^[0-9a-f]{32}$/),
 candidates: z.array(z.strictObject({
  id: z.uuid(), name: z.string(), kind: z.enum(["coder", "parent", "registration"]),
  lastAttendance: z.iso.date().nullable(), archived: z.boolean(),
 })),
 coders: z.number().int().nonnegative(),
 parents: z.number().int().nonnegative(),
 registrations: z.number().int().nonnegative(),
 applied: z.boolean(),
});
export type DataMaintenanceAction = z.infer<typeof dataMaintenanceActionSchema>;
export type DataMaintenanceRequest = z.infer<typeof dataMaintenanceRequestSchema>;
export type DataMaintenanceReport = z.infer<typeof dataMaintenanceReportSchema>;
