import { createError, defineEventHandler, getHeader, setResponseHeader, type H3Event } from "h3";
import { requireRequestMentor } from "#server/utils/requestMentor";
import { verifiedSessionId } from "#server/utils/portalSession";
import { createKioskToken, requireKioskOrigin, setKioskCookie } from "#server/utils/kioskCookie";

/** Replace the verified mentor's portal session with a kiosk-only cookie. */
export default defineEventHandler(async (event: H3Event): Promise<{ expiresAt: number }> => {
 requireKioskOrigin(event);
 const mentor: Awaited<ReturnType<typeof requireRequestMentor>> = await requireRequestMentor(event);
 const token: string = getHeader(event, "authorization")!.slice(7);
 const { data } = await mentor.client.auth.getUser(token);
 if (!data.user) throw createError({ statusCode: 401, statusMessage: "Invalid session" });
 const grant: Awaited<ReturnType<typeof createKioskToken>> = await createKioskToken();
 const { error } = await mentor.client.schema("coderdojo").rpc("revoke_portal_for_kiosk", { p_auth_user: data.user!.id, p_session: verifiedSessionId(token) });
 if (error) throw createError({ statusCode: 503, statusMessage: "Unable to end mentor session" });
 const { error: signOutError } = await mentor.client.auth.admin.signOut(token, "local");
 if (signOutError) throw createError({ statusCode: 503, statusMessage: "Unable to end mentor session" });
 setKioskCookie(event, grant.token, grant.expiresAt);
 setResponseHeader(event, "Cache-Control", "no-store");
 return { expiresAt: grant.expiresAt };
});
