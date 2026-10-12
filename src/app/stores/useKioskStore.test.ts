import { beforeEach, describe, expect, it, vi } from "vitest";
import { useKioskStore } from "./useKioskStore";

const mocks = vi.hoisted(() => ({ fetch: vi.fn(), signOut: vi.fn(), reset: vi.fn(), cancel: vi.fn(), clear: vi.fn(), channels: vi.fn(), user: { value: {} as object | null } }));
vi.mock("@tanstack/vue-query", (): object => ({ useQueryClient: (): object => ({ cancelQueries: mocks.cancel, clear: mocks.clear }) }));
vi.mock("./useAuthStore", (): object => ({ useAuthStore: (): object => ({ reset: mocks.reset }) }));
vi.mock("~/composables/useProfileAuthorization", (): object => ({ useProfileAuthorization: (): object => async (): Promise<object> => ({ Authorization: "Bearer mentor" }) }));
beforeEach((): void => {
 vi.clearAllMocks(); mocks.fetch.mockResolvedValue({ expiresAt: 123 }); mocks.signOut.mockResolvedValue({ error: null }); mocks.cancel.mockResolvedValue(undefined); mocks.channels.mockResolvedValue([]); mocks.user.value = {};
 vi.stubGlobal("$fetch", mocks.fetch); vi.stubGlobal("useSupabaseUser", (): object => mocks.user);
 vi.stubGlobal("useSupabaseClient", (): object => ({ auth: { signOut: mocks.signOut }, removeAllChannels: mocks.channels }));
});
describe("kiosk client transition", (): void => {
 it("requests the cookie before clearing mentor auth, queries and channels", async (): Promise<void> => {
  await useKioskStore().start();
  expect(mocks.fetch).toHaveBeenCalledWith("/api/Kiosk/Start", expect.objectContaining({ method: "POST", headers: { Authorization: "Bearer mentor" } }));
  expect(mocks.fetch.mock.invocationCallOrder[0]).toBeLessThan(mocks.signOut.mock.invocationCallOrder[0]!);
  expect(mocks.signOut).toHaveBeenCalledWith({ scope: "local" }); expect(mocks.reset).toHaveBeenCalled(); expect(mocks.cancel).toHaveBeenCalled(); expect(mocks.clear).toHaveBeenCalled(); expect(mocks.channels).toHaveBeenCalled(); expect(mocks.user.value).toBeNull();
 });
 it("clears local authority even when server entry fails", async (): Promise<void> => {
  mocks.fetch.mockRejectedValue(new Error("failed")); await expect(useKioskStore().start()).rejects.toThrow("failed"); expect(mocks.reset).toHaveBeenCalled(); expect(mocks.clear).toHaveBeenCalled();
 });
 it("does not report success if local sign-out fails", async (): Promise<void> => {
  mocks.signOut.mockResolvedValue({ error: new Error("logout failed") }); await expect(useKioskStore().start()).rejects.toThrow("logout failed"); expect(mocks.clear).toHaveBeenCalled();
 });
 it("clears private data even if sign-out throws", async (): Promise<void> => {
  mocks.signOut.mockRejectedValue(new Error("network failure")); await expect(useKioskStore().start()).rejects.toThrow("network failure"); expect(mocks.clear).toHaveBeenCalled(); expect(mocks.user.value).toBeNull();
 });
 it("sends all browser sign-in modes only to the cookie-scoped endpoint", async (): Promise<void> => {
  const store: ReturnType<typeof useKioskStore> = useKioskStore();
  await store.signInMember({ username: "coder", password: "abcd" }); await store.signInMemberByGuid({ memberGuid: "guid" }); await store.signInMemberByNfcTag({ nfcTag: "tag" });
  expect(mocks.fetch.mock.calls.map((call): unknown => call[0])).toEqual(Array(3).fill("/api/Kiosk/SignIn"));
  expect(mocks.fetch.mock.calls.map((call): unknown => call[1].body.kind)).toEqual(["password", "guid", "nfc"]);
  expect(mocks.fetch.mock.calls.every((call): boolean => !call[1].headers)).toBe(true);
 });
});
