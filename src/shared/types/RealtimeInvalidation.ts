import { z } from "zod";

export const DATA_TABLES = ["members", "member_parents", "member_attendances", "member_badge_categories", "member_badges", "member_belts", "badge_categories", "badges", "belts", "teams", "sessions", "session_pods"] as const;
export const realtimeInvalidationSchema = z.strictObject({ table: z.enum(DATA_TABLES), operation: z.enum(["INSERT", "UPDATE", "DELETE"]) });
export type RealtimeInvalidation = z.infer<typeof realtimeInvalidationSchema>;
export type TableInvalidation = Pick<RealtimeInvalidation, "table">;
