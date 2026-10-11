import { z } from "zod";

export type ActionNotification = { name: string; severity: "success" | "error"; message: string };
export type ActionNotificationEvents = { action: ActionNotification };
export const actionNotificationSchema: z.ZodType<ActionNotification> = z.object({
 name: z.string().trim().min(1).max(100),
 severity: z.enum(["success", "error"]),
 message: z.string().trim().min(1).max(4000),
}).strict();
