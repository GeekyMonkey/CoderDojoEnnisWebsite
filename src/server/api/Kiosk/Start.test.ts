import { beforeEach, describe, expect, it, vi } from "vitest";
import type { H3Event } from "h3";
import handler from "./Start.post";

const mocks = vi.hoisted(() => ({ mentor: vi.fn(), origin: vi.fn(), grant: vi.fn(), cookie: vi.fn(), rpc: vi.fn(), signOut: vi.fn() }));
const SESSION: string = "00000000-0000-4000-8000-000000000201";
const TOKEN: string = `header.${btoa(JSON.stringify({ session_id: SESSION }))}.signature`;
vi.mock("h3", async (original): Promise<object> => ({ ...await original<typeof import("h3")>(), getHeader: (): string => `Bearer ${TOKEN}`, setResponseHeader: vi.fn() }));
vi.mock("#server/utils/requestMentor", (): object => ({ requireRequestMentor: mocks.mentor }));
vi.mock("#server/utils/kioskCookie", (): object => ({ requireKioskOrigin: mocks.origin, createKioskToken: mocks.grant, setKioskCookie: mocks.cookie }));
const EVENT: H3Event = {} as H3Event;
beforeEach((): void => {
 vi.clearAllMocks(); mocks.grant.mockResolvedValue({ token: "signed", expiresAt: 123 });
 mocks.rpc.mockResolvedValue({ error: null }); mocks.signOut.mockResolvedValue({ error: null }); mocks.origin.mockReturnValue(undefined);
 mocks.mentor.mockResolvedValue({ client: { auth: { getUser: async (): Promise<object> => ({ data: { user: { id: "auth-user" } } }), admin: { signOut: mocks.signOut } }, schema: (): object => ({ rpc: mocks.rpc }) } });
});
describe("kiosk entry", (): void => {
 it("blocks the verified session and revokes refresh before issuing the cookie", async (): Promise<void> => {
  expect(await handler(EVENT)).toEqual({ expiresAt: 123 });
  expect(mocks.rpc).toHaveBeenCalledWith("revoke_portal_for_kiosk", { p_auth_user: "auth-user", p_session: SESSION });
  expect(mocks.signOut).toHaveBeenCalledWith(TOKEN, "local");
  expect(mocks.rpc.mock.invocationCallOrder[0]).toBeLessThan(mocks.signOut.mock.invocationCallOrder[0]!);
  expect(mocks.signOut.mock.invocationCallOrder[0]).toBeLessThan(mocks.cookie.mock.invocationCallOrder[0]!);
  expect(mocks.cookie).toHaveBeenCalledWith(EVENT, "signed", 123);
 });
 it("does not issue a cookie to a non-mentor", async (): Promise<void> => {
  mocks.mentor.mockRejectedValue({ statusCode: 403 }); await expect(handler(EVENT)).rejects.toMatchObject({ statusCode: 403 }); expect(mocks.cookie).not.toHaveBeenCalled();
 });
 it.each(["database", "auth"])("fails closed if %s revocation fails", async (failure: string): Promise<void> => {
  (failure === "database" ? mocks.rpc : mocks.signOut).mockResolvedValue({ error: { message: "failed" } });
  await expect(handler(EVENT)).rejects.toMatchObject({ statusCode: 503 }); expect(mocks.cookie).not.toHaveBeenCalled();
 });
 it("rejects origin before checking mentor or changing session", async (): Promise<void> => {
  mocks.origin.mockImplementation((): never => { throw Object.assign(new Error(), { statusCode: 403 }); });
  await expect(handler(EVENT)).rejects.toMatchObject({ statusCode: 403 }); expect(mocks.mentor).not.toHaveBeenCalled(); expect(mocks.rpc).not.toHaveBeenCalled();
 });
});
