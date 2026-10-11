import mitt, { type Emitter } from "mitt";
import type { ActionNotificationEvents } from "#shared/types/ActionNotification";

/** Create a transient event bus isolated to this application instance. */
export default defineNuxtPlugin((): { provide: { actionNotifications: Emitter<ActionNotificationEvents> } } => {
 const actionNotifications: Emitter<ActionNotificationEvents> = mitt<ActionNotificationEvents>();
 return { provide: { actionNotifications } };
});
