import type { ActionNotification } from "#shared/types/ActionNotification";

type NotificationPolicy = { visible: boolean; duration: number; color: "success" | "error"; icon: string };
export const ACTION_TOASTER: { position: "top-right"; max: number } = { position: "top-right", max: 5 };
export const ACTION_NOTIFICATION_POLICY: Record<ActionNotification["severity"], NotificationPolicy> = {
 success: { visible: true, duration: 4000, color: "success", icon: "i-lucide-check-circle" },
 error: { visible: true, duration: 8000, color: "error", icon: "i-lucide-circle-alert" },
};
export const ACTION_NOTIFICATION_OVERRIDES: Record<string, Partial<NotificationPolicy>> = {
 "profile.images.success": { visible: false },
};
/** Resolve the common severity policy and any named event override. */
export function actionNotificationPolicy(event: ActionNotification): NotificationPolicy {
 return { ...ACTION_NOTIFICATION_POLICY[event.severity], ...ACTION_NOTIFICATION_OVERRIDES[event.name] };
}
