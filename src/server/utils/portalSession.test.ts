import { describe, expect, it, vi } from "vitest";
import type { SupabaseClientType } from "#server/db/DatabaseClient";
import { requireActivePortalSession, verifiedSessionId } from "./portalSession";

const SESSION: string = "00000000-0000-4000-8000-000000000001";
const TOKEN: string = `header.${btoa(JSON.stringify({ session_id: SESSION }))}.signature`;
describe("portal session replay boundary", (): void => {
 it("requires a verified token's valid session UUID", (): void => {
  expect(verifiedSessionId(TOKEN)).toBe(SESSION);
  for (const token of ["invalid", `header.${btoa('{}')}.signature`, `header.${btoa('{"session_id":"forged"}')}.signature`]) expect(() => verifiedSessionId(token)).toThrow();
 });
 it.each([false, true, null])("handles revoked-session result %s", async (revoked: boolean | null): Promise<void> => {
  const rpc = vi.fn().mockResolvedValue({ data: revoked, error: null });
  const client: SupabaseClientType = { schema: (): object => ({ rpc }) } as unknown as SupabaseClientType;
  const result: Promise<void> = requireActivePortalSession(client, TOKEN);
  if (revoked === false) await expect(result).resolves.toBeUndefined(); else await expect(result).rejects.toMatchObject({ statusCode: revoked ? 401 : 503 });
  expect(rpc).toHaveBeenCalledWith("is_kiosk_session_revoked", { p_session: SESSION });
 });
});
