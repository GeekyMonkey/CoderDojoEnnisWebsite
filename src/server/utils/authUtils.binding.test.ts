import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { H3Event } from "h3";
import type { MemberSupabaseModel } from "#shared/types/models/MemberModel";
import { LoginToSupabase } from "./authUtils";

const mocks = vi.hoisted(() => ({ createClient: vi.fn(), signIn: vi.fn(), userRpc: vi.fn(), serviceRpc: vi.fn() }));
vi.mock("@supabase/supabase-js", async (original): Promise<unknown> => ({ ...await original<object>(), createClient: mocks.createClient }));
const MEMBER: MemberSupabaseModel = {memberId:"00000000-0000-4000-8000-000000000003",isMentor:false,isNinja:true,isParent:false,nameFirst:"Fixture",nameLast:"Coder"};
const EVENT: H3Event = {} as H3Event;

beforeEach((): void => {
 vi.resetAllMocks();
 vi.stubGlobal("useRuntimeConfig", (): object => ({ public:{supabase:{url:"https://example.supabase.co"}},private:{supabase:{key_private:"fixture-service-key"},auth:{pass_salt:"fixture-salt"}} }));
 const user: object = {id:"auth-user",email:`${MEMBER.memberId}@coderdojoennis.com`,user_metadata:{...MEMBER,nameFirst:"Fixture",nameLast:"Coder"}};
 mocks.signIn.mockResolvedValue({data:{user,session:{access_token:"secret-token"}},error:null});
 mocks.serviceRpc.mockResolvedValue({error:null});
 mocks.createClient.mockReturnValueOnce({auth:{signInWithPassword:mocks.signIn},schema:():object=>({rpc:mocks.userRpc})}).mockReturnValueOnce({schema:():object=>({rpc:mocks.serviceRpc})});
});
afterEach((): void => { vi.unstubAllGlobals(); });
describe("login identity provisioning", (): void => {
 it("uses a fresh service client after signing in and never logs session credentials", async (): Promise<void> => {
  const logs: string[] = [];
  const result: unknown = await LoginToSupabase(EVENT,MEMBER,logs);
  expect(result).toMatchObject({session:{access_token:"secret-token"}});
  expect(mocks.userRpc).not.toHaveBeenCalled();
  expect(mocks.serviceRpc).toHaveBeenCalledWith("ensure_member_auth_binding",{p_auth_user:"auth-user",p_member:MEMBER.memberId});
  expect(logs.join(" ")).not.toContain("secret-token");
 });
 it("does not return an app session when protected binding provisioning fails", async (): Promise<void> => {
  mocks.serviceRpc.mockResolvedValue({error:{code:"42501"}});
  expect(await LoginToSupabase(EVENT,MEMBER,[])).toBeNull();
 });
});
