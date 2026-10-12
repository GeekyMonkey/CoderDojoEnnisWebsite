import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ session: vi.fn(), navigate: vi.fn() }));
vi.mock("nuxt/app", (): object => ({ defineNuxtRouteMiddleware: (callback: unknown): unknown => callback, navigateTo: mocks.navigate }));
vi.mock("../stores/useAuthStore", (): object => ({ useAuthStore: (): object => ({ initializing: { value: false }, ready: { value: true }, isAuthenticated: { value: true } }) }));
let handler: (to: { path: string; fullPath: string }, from: object) => Promise<void>;
beforeAll(async (): Promise<void> => {
 vi.stubGlobal("useLogger", (): object => ({ info: vi.fn(), error: vi.fn() }));
 handler = (await import("./auth.global")).default as unknown as typeof handler;
});
beforeEach((): void => {
 vi.clearAllMocks(); mocks.session.mockResolvedValue({ data: { session: null } });
 // Simulate stale mentor refs restored from browser history after kiosk handover.
 vi.stubGlobal("useSupabaseUser", (): object => ({ value: { aud: "authenticated" } }));
 vi.stubGlobal("useSupabaseClient", (): object => ({ auth: { getSession: mocks.session } }));
});
describe("management navigation after kiosk logout", (): void => {
 it.each(["/mentor", "/mentor/attendance", "/parent", "/coder"])("requires fresh session on %s despite stale authenticated refs", async (path: string): Promise<void> => {
  await handler({ path, fullPath: path }, {}); expect(mocks.navigate).toHaveBeenCalledWith("/login");
 });
 it("permits a newly authenticated session", async (): Promise<void> => {
  mocks.session.mockResolvedValue({ data: { session: { user: { id: "fresh" } } } });
  await handler({ path: "/mentor", fullPath: "/mentor" }, {}); expect(mocks.navigate).not.toHaveBeenCalled();
 });
});
