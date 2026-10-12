import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { H3Event } from "h3";
import { createKioskToken, verifyKioskToken, requireKioskOrigin, setKioskCookie, clearKioskCookie } from "./kioskCookie";

const mocks = vi.hoisted(() => ({ origin: vi.fn(), set: vi.fn(), clear: vi.fn() }));
vi.mock("h3", async (original): Promise<object> => ({ ...await original<typeof import("h3")>(), getHeader: mocks.origin, getRequestURL: (): URL => new URL("https://dojo.test/api/Kiosk/Start"), setCookie: mocks.set, deleteCookie: mocks.clear }));
const EVENT: H3Event = {} as H3Event;
const NOON: number = Date.parse("2026-10-12T12:00:00Z");
beforeEach((): void => { vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "test-secret"); vi.clearAllMocks(); });
afterEach((): void => { vi.unstubAllEnvs(); });
describe("bounded kiosk cookie", (): void => {
 it("accepts a signed kiosk-only grant and caps its duration", async (): Promise<void> => {
  const grant: Awaited<ReturnType<typeof createKioskToken>> = await createKioskToken(NOON);
  expect(await verifyKioskToken(grant.token, NOON)).toMatchObject({ scope: "kiosk", expiresAt: grant.expiresAt });
  expect(grant.expiresAt).toBeLessThanOrEqual(NOON + 12 * 3600_000);
 });
 it.each(["2026-06-01T22:50:00Z", "2026-12-01T23:50:00Z"])("expires at Dublin midnight from %s", async (instant: string): Promise<void> => {
  const now: number = Date.parse(instant); const grant: Awaited<ReturnType<typeof createKioskToken>> = await createKioskToken(now);
  expect(grant.expiresAt - now).toBe(10 * 60_000);
  await expect(verifyKioskToken(grant.token, grant.expiresAt)).rejects.toMatchObject({ statusCode: 401 });
 });
 it.each(["2026-03-29T00:30:00Z", "2026-10-25T00:30:00Z"])("keeps a 12-hour cap across DST at %s", async (instant: string): Promise<void> => {
  const now: number = Date.parse(instant); expect((await createKioskToken(now)).expiresAt - now).toBe(12 * 3600_000);
 });
 it("rejects altered, missing and expired cookies", async (): Promise<void> => {
  const grant: Awaited<ReturnType<typeof createKioskToken>> = await createKioskToken(NOON);
  for (const token of ["", "date-only", `x${grant.token}`, `${grant.token}.extra`]) await expect(verifyKioskToken(token, NOON)).rejects.toMatchObject({ statusCode: 401 });
  await expect(verifyKioskToken(grant.token, NOON + 24 * 3600_000)).rejects.toMatchObject({ statusCode: 401 });
 });
 it("fails closed when no signing secret is available", async (): Promise<void> => {
  vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", ""); await expect(createKioskToken()).rejects.toMatchObject({ statusCode: 503 });
 });
 it("rejects cross-origin and absent-origin mutations", (): void => {
  for (const origin of [undefined, "https://other.test", "null"]) { mocks.origin.mockReturnValue(origin); expect(() => requireKioskOrigin(EVENT)).toThrow(); }
  mocks.origin.mockReturnValue("https://dojo.test"); expect(() => requireKioskOrigin(EVENT)).not.toThrow();
 });
 it("sets host-only secure HttpOnly strict cookies on a dedicated API path", (): void => {
  vi.stubEnv("NODE_ENV", "production"); setKioskCookie(EVENT, "signed", NOON); clearKioskCookie(EVENT);
  expect(mocks.set).toHaveBeenCalledWith(EVENT, "dojo-kiosk", "signed", expect.objectContaining({ secure: true, httpOnly: true, sameSite: "strict", path: "/api/Kiosk" }));
  expect(mocks.set.mock.calls[0]![3]).not.toHaveProperty("domain");
  expect(mocks.clear).toHaveBeenCalledWith(EVENT, "dojo-kiosk", expect.objectContaining({ path: "/api/Kiosk" }));
 });
});
