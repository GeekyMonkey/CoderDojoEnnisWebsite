import { actionNotificationSchema, type ActionNotification } from "#shared/types/ActionNotification";

/** Publish validated operation outcomes without deciding their presentation. */
export function useActionNotifications(): { publish: (event: ActionNotification) => void } {
 const app: ReturnType<typeof useNuxtApp> = useNuxtApp();
 /** Publish a client-local outcome to the application presenter. */
 function publish(event: ActionNotification): void {
  if (import.meta.client) app.$actionNotifications.emit("action", actionNotificationSchema.parse(event));
 }
 return { publish };
}
