import { defineEventHandler, setResponseHeader, type H3Event } from "h3";
import { requireKiosk } from "#server/utils/kioskCookie";

/** Verify kiosk access without exposing the security cookie. */
export default defineEventHandler(async (event: H3Event): Promise<{ expiresAt: number }> => {
 const grant: Awaited<ReturnType<typeof requireKiosk>> = await requireKiosk(event);
 setResponseHeader(event, "Cache-Control", "no-store");
 return { expiresAt: grant.expiresAt };
});
