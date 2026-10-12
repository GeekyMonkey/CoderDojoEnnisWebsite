import { createError } from "h3";
import type { SupabaseClientType } from "#server/db/DatabaseClient";

/** Read a session UUID only after the caller has verified the token with Supabase. */
export function verifiedSessionId(token: string): string {
 try {
  const payload: { session_id?: unknown } = JSON.parse(atob(token.split(".")[1]!.replace(/-/g, "+").replace(/_/g, "/")));
  if (typeof payload.session_id === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(payload.session_id)) return payload.session_id;
 } catch { /* Invalid verified session shape fails closed. */ }
 throw createError({ statusCode: 401, statusMessage: "Invalid session" });
}

/** Deny replay of a portal token after it has been handed over to a kiosk. */
export async function requireActivePortalSession(client: SupabaseClientType, token: string): Promise<void> {
 const sessionId: string = verifiedSessionId(token);
 const { data, error } = await client.schema("coderdojo").rpc("is_kiosk_session_revoked", { p_session: sessionId });
 if (error || typeof data !== "boolean") throw createError({ statusCode: 503, statusMessage: "Unable to verify session" });
 if (data) throw createError({ statusCode: 401, statusMessage: "Session ended" });
}
