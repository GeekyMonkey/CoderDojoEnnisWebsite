import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Session } from "@supabase/supabase-js";
import type { H3Event } from "h3";
import { memberFromRecord, type MemberRecord } from "#shared/types/models/MemberModel";
import { AuthService } from "./AuthService";

const mocks = vi.hoisted(() => ({ client: vi.fn(), rpc: vi.fn(), hash: vi.fn(), login: vi.fn(), candidates: vi.fn(), nfc: vi.fn() }));
vi.mock("#imports", (): object => ({ useRuntimeConfig: (): object => ({ private: { auth: { pass_salt: "test" } } }) }));
vi.mock("#server/db/DatabaseClient", (): object => ({ GetSupabaseAdminClient: mocks.client }));
vi.mock("#server/db/MembersData", (): object => ({ MembersData: { GetMembersByLoginUsername: mocks.candidates, GetMemberByNfcTag: mocks.nfc } }));
vi.mock("#server/utils/authUtils", (): object => ({ GeneratePasswordHash: mocks.hash, LoginToSupabase: mocks.login }));
const RECORD: MemberRecord = { id: "00000000-0000-4000-8000-000000000001", name_first: "Original", name_last: "Coder", birth_year: null, deleted: false, email: null, fingerprint_id: null, nfc_tag: "device", garda_vetted: false, github_login: null, goal_long_term: null, goal_short_term: null, has_avatar: false, has_photo: false, is_mentor: false, is_ninja: true, is_parent: false, login: "coder", login_date: null, login_date_previous: null, phone: null, registered_current_term: false, scratch_name: null, team_id: null, xbox_gamertag: null, password_hash: "valid-hash" };
const SESSION: Session = { access_token: "test-token", refresh_token: "test-refresh", expires_in: 3600, token_type: "bearer", user: { id: "00000000-0000-4000-8000-000000000101", app_metadata: {}, user_metadata: {}, aud: "authenticated", created_at: "2026-10-12T00:00:00Z" } };
const EVENT: H3Event = {} as H3Event;

beforeEach((): void => {
 vi.clearAllMocks();
 mocks.client.mockResolvedValue({ schema: (): object => ({ rpc: mocks.rpc }) });
 mocks.rpc.mockResolvedValue({ data: { ...RECORD, name_first: "Current", login_date: "2026-10-12T12:00:00.000Z", password_hash: undefined }, error: null });
 mocks.hash.mockResolvedValue("valid-hash");
 mocks.login.mockResolvedValue({ session: SESSION });
 mocks.candidates.mockResolvedValue([RECORD]);
 mocks.nfc.mockResolvedValue(memberFromRecord(RECORD));
});
describe("portal login history", (): void => {
 it("records password login only after session success and returns current fields", async (): Promise<void> => {
  const result: Awaited<ReturnType<AuthService["loginWithPassword"]>> = await new AuthService(EVENT).loginWithPassword("coder", "password");
  expect(mocks.rpc).toHaveBeenCalledWith("record_portal_login", { p_member: RECORD.id, p_auth_user: SESSION.user.id, p_kind: "password", p_credential: "valid-hash" });
  expect(mocks.login.mock.invocationCallOrder[0]).toBeLessThan(mocks.rpc.mock.invocationCallOrder[0]!);
  expect(result.member.nameFirst).toBe("Current");
  expect(result.member.loginDate).toBe(Date.parse("2026-10-12T12:00:00Z"));
  expect(result.member.loginDatePrevious).toBeNull();
  expect(result.member).not.toHaveProperty("password_hash");
  expect(result.session).toBe(SESSION);
 });
 it("records successful NFC login with the trimmed verified tag", async (): Promise<void> => {
  await new AuthService(EVENT).loginWithNfcTag(" device ");
  expect(mocks.rpc).toHaveBeenCalledWith("record_portal_login", expect.objectContaining({ p_kind: "nfc", p_credential: "device" }));
 });
 it("does not mutate history when only validating kiosk credentials", async (): Promise<void> => {
  await new AuthService(EVENT).validateCredentials("coder", "password");
  expect(mocks.login).not.toHaveBeenCalled(); expect(mocks.rpc).not.toHaveBeenCalled();
 });
 it("does not mutate failed password login", async (): Promise<void> => {
  mocks.hash.mockResolvedValue("invalid-hash");
  await expect(new AuthService(EVENT).loginWithPassword("coder", "wrong")).rejects.toMatchObject({ code: "INVALID_CREDENTIALS" });
  expect(mocks.login).not.toHaveBeenCalled(); expect(mocks.rpc).not.toHaveBeenCalled();
 });
 it("does not mutate failed NFC login", async (): Promise<void> => {
  mocks.nfc.mockResolvedValue(null);
  await expect(new AuthService(EVENT).loginWithNfcTag("unknown")).rejects.toMatchObject({ code: "NO_MATCHING_MEMBER" });
  expect(mocks.rpc).not.toHaveBeenCalled();
 });
 it.each(["password", "nfc"])("does not mutate history after %s session creation failure", async (mode: string): Promise<void> => {
  mocks.login.mockResolvedValue(null);
  const service: AuthService = new AuthService(EVENT);
  await expect(mode === "password" ? service.loginWithPassword("coder", "password") : service.loginWithNfcTag("device")).rejects.toMatchObject({ code: "SESSION_ERROR" });
  expect(mocks.rpc).not.toHaveBeenCalled();
 });
 it("does not return success after history persistence failure", async (): Promise<void> => {
  mocks.rpc.mockResolvedValue({ data: null, error: { message: "write failed" } });
  await expect(new AuthService(EVENT).loginWithPassword("coder", "password")).rejects.toMatchObject({ code: "LOGIN_HISTORY_ERROR" });
 });
 it("does not return success for malformed committed data", async (): Promise<void> => {
  mocks.rpc.mockResolvedValue({ data: { id: RECORD.id }, error: null });
  await expect(new AuthService(EVENT).loginWithNfcTag("device")).rejects.toMatchObject({ code: "LOGIN_HISTORY_ERROR" });
 });
});
