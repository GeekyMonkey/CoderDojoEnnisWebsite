import { beforeEach, describe, expect, it, vi } from "vitest";
import type { H3Event } from "h3";
import { memberFromRecord, type MemberRecord, type MemberModel } from "#shared/types/models/MemberModel";
import { AttendanceService } from "./AttendanceService";

const mocks = vi.hoisted(() => ({ client: vi.fn(), rpc: vi.fn() }));
vi.mock("#server/db/DatabaseClient", (): object => ({ GetSupabaseAdminClient: mocks.client }));
const RECORD: MemberRecord = { id: "00000000-0000-4000-8000-000000000001", name_first: "Current", name_last: "Parent", birth_year: null, deleted: false, email: null, fingerprint_id: null, nfc_tag: null, garda_vetted: false, github_login: null, goal_long_term: null, goal_short_term: null, has_avatar: false, has_photo: false, is_mentor: false, is_ninja: false, is_parent: true, login: null, login_date: "2026-10-12T12:00:00Z", login_date_previous: "2026-10-01T12:00:00Z", phone: null, registered_current_term: false, scratch_name: null, team_id: null, xbox_gamertag: null, password_hash: null };
const EVENT: H3Event = {} as H3Event;

beforeEach((): void => {
 vi.clearAllMocks();
 mocks.client.mockResolvedValue({ schema: (): object => ({ rpc: mocks.rpc }) });
 mocks.rpc.mockResolvedValue({ data: { member: RECORD, sessionCount: 2 }, error: null });
});
describe("attendance service commit response", (): void => {
 it("returns committed member fields instead of the earlier lookup snapshot", async (): Promise<void> => {
  const stale: MemberModel = { ...memberFromRecord(RECORD), nameFirst: "Old", isParent: false };
  const response: Awaited<ReturnType<AttendanceService["signInMember"]>> = await new AttendanceService(EVENT).signInMember(stale);
  expect(response.memberName).toBe("Current Parent");
  expect(response.memberDetails.isParent).toBe(true);
  expect(response.memberSessionCount).toBe(2);
  expect(stale.nameFirst).toBe("Old");
  expect(mocks.rpc).toHaveBeenCalledWith("sign_in_attendance", expect.objectContaining({ p_member: RECORD.id, p_testing: false }));
 });
 it("does not report success after a database write error", async (): Promise<void> => {
  mocks.rpc.mockResolvedValue({ data: null, error: { message: "failed" } });
  await expect(new AttendanceService(EVENT).signInMember(memberFromRecord(RECORD))).rejects.toMatchObject({ code: "SIGN_IN_FAILED" });
 });
 it("does not report success without a committed result", async (): Promise<void> => {
  mocks.rpc.mockResolvedValue({ data: null, error: null });
  await expect(new AttendanceService(EVENT).signInMember(memberFromRecord(RECORD))).rejects.toMatchObject({ code: "SIGN_IN_FAILED" });
 });
 it("fails on malformed committed member data", async (): Promise<void> => {
  mocks.rpc.mockResolvedValue({ data: { member: { id: RECORD.id }, sessionCount: 1 }, error: null });
  await expect(new AttendanceService(EVENT).signInMember(memberFromRecord(RECORD))).rejects.toMatchObject({ code: "SIGN_IN_FAILED" });
 });
 it("fails when the database client is unavailable", async (): Promise<void> => {
  mocks.client.mockResolvedValue(null);
  await expect(new AttendanceService(EVENT).signInMember(memberFromRecord(RECORD))).rejects.toMatchObject({ code: "SIGN_IN_FAILED" });
 });
 it("preserves the testing-mode contract", async (): Promise<void> => {
  await new AttendanceService(EVENT).signInMember(memberFromRecord(RECORD), true);
  expect(mocks.rpc).toHaveBeenCalledWith("sign_in_attendance", expect.objectContaining({ p_testing: true }));
 });
});
