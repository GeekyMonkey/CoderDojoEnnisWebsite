import { beforeEach, describe, expect, it, vi } from "vitest";
import handler from "./kiosk";

const mocks = vi.hoisted(() => ({ session: vi.fn(), status: vi.fn(), navigate: vi.fn() }));
vi.mock("nuxt/app", (): object => ({ defineNuxtRouteMiddleware: (callback: unknown): unknown => callback, navigateTo: mocks.navigate }));
vi.mock("~/stores/useKioskStore", (): object => ({ useKioskStore: (): object => ({ status: mocks.status }) }));
beforeEach((): void => { vi.clearAllMocks(); mocks.session.mockResolvedValue({ data: { session: null } }); mocks.status.mockResolvedValue({ expiresAt: 123 }); vi.stubGlobal("useSupabaseClient", (): object => ({ auth: { getSession: mocks.session } })); });
describe("kiosk route lifecycle", (): void => {
 it("allows reload with a valid cookie and no portal session", async (): Promise<void> => { await (handler as unknown as () => Promise<void>)(); expect(mocks.status).toHaveBeenCalled(); expect(mocks.navigate).not.toHaveBeenCalled(); });
 it("returns missing or expired sessions to fresh authentication", async (): Promise<void> => { mocks.status.mockRejectedValue({ statusCode: 401 }); await (handler as unknown as () => Promise<void>)(); expect(mocks.navigate).toHaveBeenCalledWith("/login"); });
 it("routes a retained portal session through the mentor logout transition", async (): Promise<void> => { mocks.session.mockResolvedValue({ data: { session: {} } }); await (handler as unknown as () => Promise<void>)(); expect(mocks.navigate).toHaveBeenCalledWith("/mentor/SignIn"); expect(mocks.status).not.toHaveBeenCalled(); });
});
