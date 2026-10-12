import { defineEventHandler, type H3Event } from "h3";
import { clearKioskCookie, requireKioskOrigin } from "#server/utils/kioskCookie";

/** End kiosk access without restoring any mentor credentials. */
export default defineEventHandler((event: H3Event): { success: true } => {
 requireKioskOrigin(event); clearKioskCookie(event); return { success: true };
});
