import { afterEach, beforeEach, describe, expect, it, vi, type Mock } from "vitest";
import type { MemberIdentity } from "#shared/types/MemberIdentity";
import { DATA_TABLES, type TableInvalidation } from "#shared/types/RealtimeInvalidation";
import { UseSupabaseRealtimeAllTables } from "./UseSupabaseRealtimeAllTables";

const mocks = vi.hoisted(() => ({
 getIdentity: vi.fn(), getSession: vi.fn(), setAuth: vi.fn(), removeChannel: vi.fn(), channel: vi.fn(), clear: vi.fn(),
 cacheSubscribe: vi.fn(), allQueries: vi.fn(), authSubscribe: vi.fn(), stopAuth: vi.fn(), stopCache: vi.fn(),
}));
vi.mock("./UseSupabaseClient", (): object => ({ UseSupabaseClient: (): object => ({ supabaseClient: {
 channel: mocks.channel, removeChannel: mocks.removeChannel, realtime: { setAuth: mocks.setAuth },
 auth: { getSession: mocks.getSession, onAuthStateChange: mocks.authSubscribe },
} }) }));
vi.mock("~/stores/useAuthStore", (): object => ({ useAuthStore: (): object => ({ getIdentity: mocks.getIdentity }) }));
vi.mock("@tanstack/vue-query", (): object => ({ useQueryClient: (): object => ({ clear: mocks.clear, getQueryCache: (): object => ({ subscribe: mocks.cacheSubscribe, getAll: mocks.allQueries }) }) }));

type FakeChannel = { on: ReturnType<typeof vi.fn>; subscribe: ReturnType<typeof vi.fn> };
let app: object;
let channels: FakeChannel[];
let unmount: () => void;
const IDENTITY: MemberIdentity = { id: "00000000-0000-4000-8000-000000000003", isMentor: false, isParent: false, isNinja: true };
/** Flush queued authentication and channel setup without real network calls. */
async function settle(): Promise<void> { for (let i: number = 0; i < 15; i++) await Promise.resolve(); }

beforeEach((): void => {
 vi.resetAllMocks(); vi.useFakeTimers(); channels = []; mocks.allQueries.mockReturnValue([]);
 app = { vueApp: { onUnmount: (callback: () => void): void => { unmount = callback; } } };
 vi.stubGlobal("useNuxtApp", (): object => app);
 mocks.getIdentity.mockResolvedValue(IDENTITY);
 mocks.getSession.mockResolvedValue({ data: { session: { access_token: "verified-token" } } });
 mocks.authSubscribe.mockReturnValue({ data: { subscription: { unsubscribe: mocks.stopAuth } } });
 mocks.cacheSubscribe.mockReturnValue(mocks.stopCache);
 mocks.channel.mockImplementation((): FakeChannel => {
  const channel: FakeChannel = { on: vi.fn(), subscribe: vi.fn() };
  channel.on.mockReturnValue(channel); channel.subscribe.mockReturnValue(channel); channels.push(channel); return channel;
 });
});
afterEach((): void => { unmount?.(); vi.useRealTimers(); vi.unstubAllGlobals(); });

describe("private realtime invalidation lifecycle", (): void => {
 it("shares one private channel per app and rejects row/credential payloads", async (): Promise<void> => {
  const realtime: ReturnType<typeof UseSupabaseRealtimeAllTables> = UseSupabaseRealtimeAllTables();
  expect(UseSupabaseRealtimeAllTables()).toBe(realtime);
  const receive: Mock<(event: TableInvalidation) => void> = vi.fn(); realtime.events.on("UPDATE",receive);
  await settle();
  expect(mocks.channel).toHaveBeenCalledWith(`coderdojo:member:${IDENTITY.id}`, { config: { private: true } });
  expect(channels[0]?.on).toHaveBeenCalledWith("broadcast", { event: "invalidate" }, expect.any(Function));
  const handler: (message: { payload: unknown }) => void = channels[0]?.on.mock.calls[0]?.[2];
  handler({ payload: { table: "members", operation: "UPDATE", password_hash: "secret", id: "other" } });
  handler({ payload: { table: "auth.users", operation: "UPDATE" } });
  expect(receive).not.toHaveBeenCalled();
  handler({ payload: { table: "members", operation: "UPDATE" } });
  expect(receive).toHaveBeenCalledWith({table:"members"});
  const subscribed: (status: string) => void = channels[0]?.subscribe.mock.calls[0]?.[0];
  subscribed("SUBSCRIBED"); expect(receive).toHaveBeenCalledTimes(DATA_TABLES.length+1);
 });
 it("rechecks identity each minute and clears data when current roles change", async (): Promise<void> => {
  UseSupabaseRealtimeAllTables(); await settle();
  mocks.getIdentity.mockResolvedValue({...IDENTITY,isParent:true});
  await vi.advanceTimersByTimeAsync(60_000); await settle();
  expect(mocks.getIdentity).toHaveBeenCalledTimes(2);
  expect(mocks.removeChannel).toHaveBeenCalledWith(channels[0]);
  expect(mocks.clear).toHaveBeenCalledOnce();
 });
 it("clears data and stops private channels after revoked authority", async (): Promise<void> => {
  const realtime: ReturnType<typeof UseSupabaseRealtimeAllTables> = UseSupabaseRealtimeAllTables(); await settle();
  mocks.getIdentity.mockRejectedValue({statusCode:403});
  await vi.advanceTimersByTimeAsync(60_000); await settle();
  expect(realtime.channel).toBeNull(); expect(mocks.clear).toHaveBeenCalledOnce();
  expect(mocks.channel).toHaveBeenCalledOnce();
 });
 it("clears cache on guarded query denial and logout and disposes the transport", async (): Promise<void> => {
  UseSupabaseRealtimeAllTables(); await settle();
  const setState: Mock<(state: unknown) => void> = vi.fn();
  mocks.allQueries.mockReturnValue([{setState}]);
  const changed: (event: unknown) => void = mocks.cacheSubscribe.mock.calls[0]?.[0];
  changed({type:"updated",action:{type:"error"},query:{state:{error:{statusCode:403}}}});
  expect(mocks.clear).toHaveBeenCalledOnce();
  expect(setState).toHaveBeenCalledWith(expect.objectContaining({data:undefined,error:null,status:"pending"}));
  const authChanged: (event: string) => void = mocks.authSubscribe.mock.calls[0]?.[0];
  mocks.getIdentity.mockRejectedValue({statusCode:401}); authChanged("SIGNED_OUT"); await settle();
  expect(mocks.clear.mock.calls.length).toBeGreaterThanOrEqual(2);
  unmount(); const calls: number = mocks.getIdentity.mock.calls.length;
  await vi.advanceTimersByTimeAsync(120_000);
  expect(mocks.getIdentity).toHaveBeenCalledTimes(calls);
  expect(mocks.stopAuth).toHaveBeenCalled(); expect(mocks.stopCache).toHaveBeenCalled();
 });
 it("isolates subscription state across Nuxt app instances", async (): Promise<void> => {
  const first: ReturnType<typeof UseSupabaseRealtimeAllTables> = UseSupabaseRealtimeAllTables(); await settle();
  unmount(); app = {vueApp:{onUnmount:(callback:()=>void):void=>{unmount=callback;}}};
  const second: ReturnType<typeof UseSupabaseRealtimeAllTables> = UseSupabaseRealtimeAllTables(); await settle();
  expect(first).not.toBe(second); expect(mocks.channel).toHaveBeenCalledTimes(2);
 });
});
