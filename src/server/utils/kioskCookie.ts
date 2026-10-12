import { createError, deleteCookie, getCookie, getHeader, getRequestURL, setCookie, type H3Event } from "h3";

const COOKIE_NAME: string = "dojo-kiosk";
const COOKIE_PATH: string = "/api/Kiosk";
const MAX_AGE_MS: number = 12 * 60 * 60 * 1000;
type KioskGrant = { scope: "kiosk"; expiresAt: number; day: string; nonce: string };

/** Return the current Dublin calendar day, including daylight-saving changes. */
export function kioskDay(now: number): string {
 return new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Dublin", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date(now));
}

/** Import the server secret for a domain-separated kiosk HMAC. */
async function signingKey(): Promise<CryptoKey> {
 const secret: string | undefined = process.env.SUPABASE_SERVICE_ROLE_KEY;
 if (!secret) throw createError({ statusCode: 503, statusMessage: "Kiosk unavailable" });
 return crypto.subtle.importKey("raw", new TextEncoder().encode(`coderdojo-kiosk-v1:${secret}`), { name: "HMAC", hash: "SHA-256" }, false, ["sign", "verify"]);
}

/** Encode binary data for a cookie-safe value. */
function encode(bytes: Uint8Array): string {
 return btoa(String.fromCharCode(...bytes)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

/** Decode a cookie-safe value into binary data. */
function decode(value: string): Uint8Array<ArrayBuffer> {
 return Uint8Array.from(atob(value.replace(/-/g, "+").replace(/_/g, "/")), (character: string): number => character.charCodeAt(0));
}

/** Reject cross-origin cookie mutations before any state change. */
export function requireKioskOrigin(event: H3Event): void {
 if (getHeader(event, "origin") !== getRequestURL(event).origin) throw createError({ statusCode: 403, statusMessage: "Same-origin request required" });
}

/** Mint a signed kiosk-only capability with a bounded lifetime. */
export async function createKioskToken(now: number = Date.now()): Promise<{ token: string; expiresAt: number }> {
 const day: string = kioskDay(now);
 let expiresAt: number = now + MAX_AGE_MS;
 // Find the exact next Dublin day boundary, including DST, by bounded binary search.
 if (kioskDay(expiresAt) !== day) {
  let low: number = now; let high: number = expiresAt;
  while (high - low > 1) { const middle: number = Math.floor((low + high) / 2); if (kioskDay(middle) === day) low = middle; else high = middle; }
  expiresAt = high;
 }
 const grant: KioskGrant = { scope: "kiosk", expiresAt, day, nonce: crypto.randomUUID() };
 const payload: string = encode(new TextEncoder().encode(JSON.stringify(grant)));
 const signature: ArrayBuffer = await crypto.subtle.sign("HMAC", await signingKey(), new TextEncoder().encode(payload));
 return { token: `${payload}.${encode(new Uint8Array(signature))}`, expiresAt };
}

/** Verify signature, scope, day and expiry on every kiosk request. */
export async function verifyKioskToken(token: string, now: number = Date.now()): Promise<KioskGrant> {
 const key: CryptoKey = await signingKey();
 try {
  if (token.length > 1024) throw new Error("Oversized cookie");
  const parts: string[] = token.split(".");
  if (parts.length !== 2 || !await crypto.subtle.verify("HMAC", key, decode(parts[1]!), new TextEncoder().encode(parts[0]!))) throw new Error("Invalid signature");
  const grant: KioskGrant = JSON.parse(new TextDecoder().decode(decode(parts[0]!)));
  if (grant.scope !== "kiosk" || !Number.isSafeInteger(grant.expiresAt) || grant.expiresAt <= now || grant.expiresAt > now + MAX_AGE_MS || grant.day !== kioskDay(now) || typeof grant.nonce !== "string") throw new Error("Expired cookie");
  return grant;
 } catch { throw createError({ statusCode: 401, statusMessage: "Kiosk session required" }); }
}

/** Require a valid kiosk cookie without granting a portal identity. */
export async function requireKiosk(event: H3Event): Promise<KioskGrant> {
 return verifyKioskToken(getCookie(event, COOKIE_NAME) ?? "");
}

/** Store the capability as a host-only, non-script-readable cookie. */
export function setKioskCookie(event: H3Event, token: string, expiresAt: number): void {
 setCookie(event, COOKIE_NAME, token, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "strict", path: COOKIE_PATH, expires: new Date(expiresAt), maxAge: Math.max(0, Math.floor((expiresAt - Date.now()) / 1000)) });
}

/** Remove the kiosk capability when the operator ends sign-in mode. */
export function clearKioskCookie(event: H3Event): void {
 deleteCookie(event, COOKIE_NAME, { path: COOKIE_PATH, httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "strict" });
}
