import { beforeEach, describe, expect, it, vi } from "vitest";
import type { H3Event } from "h3";
import handler from "./SignIn.post";

const mocks = vi.hoisted(() => ({ cookie: vi.fn(), origin: vi.fn(), body: vi.fn(), password: vi.fn(), guid: vi.fn(), nfc: vi.fn(), attendance: vi.fn(), eq: vi.fn() }));
vi.mock("h3", async (original): Promise<object> => ({ ...await original<typeof import("h3")>(), readBody: mocks.body, setResponseHeader: vi.fn() }));
vi.mock("#server/utils/kioskCookie", (): object => ({ requireKiosk: mocks.cookie, requireKioskOrigin: mocks.origin }));
vi.mock("#server/services/AuthService", (): object => ({ AuthService: class { validateCredentials = mocks.password; } }));
vi.mock("#server/services/AttendanceService", (): object => ({ AttendanceService: class { signInMember = mocks.attendance; } }));
vi.mock("#server/db/MembersData", (): object => ({ MembersData: { GetMemberById: mocks.guid, GetMemberByNfcTag: mocks.nfc } }));
vi.mock("#server/db/DatabaseClient", (): object => ({ GetSupabaseAdminClient: async (): Promise<object> => {
 const query: object = { select: (): object => query, eq: mocks.eq, not: (): object => query, order: (): object => query, limit: (): object => query, maybeSingle: async (): Promise<object> => ({ data: null, error: null }) };
 mocks.eq.mockReturnValue(query); return { schema: (): object => ({ from: (): object => query }) };
} }));
const EVENT: H3Event = {} as H3Event;
const MEMBER: object = { id: "00000000-0000-4000-8000-000000000001", deleted: false, isNinja: true, isMentor: false, isParent: false, teamId: null, nameFirst: "Coder", nameLast: "One", email: "private@example.test", login: "private", nfcTag: "secret", fingerprintId: 12 };
beforeEach((): void => {
 vi.clearAllMocks(); mocks.cookie.mockResolvedValue({ expiresAt: 123 }); mocks.origin.mockReturnValue(undefined);
 mocks.body.mockResolvedValue({ kind: "password", username: "coder", password: "abcd" }); mocks.password.mockResolvedValue({ member: MEMBER }); mocks.guid.mockResolvedValue(MEMBER); mocks.nfc.mockResolvedValue(MEMBER);
 mocks.attendance.mockResolvedValue({ memberId: "id", memberName: "Coder One", memberSessionCount: 1, memberMessage: "Welcome", memberDetails: MEMBER, notifications: [], logs: ["private log"] });
});
describe("bounded kiosk attendance", (): void => {
 it.each(["password", "guid", "nfc"])("supports %s without exposing contacts or scanners", async (kind: string): Promise<void> => {
  mocks.body.mockResolvedValue(kind === "password" ? { kind, username: "coder", password: "abcd" } : kind === "guid" ? { kind, memberGuid: "00000000-0000-4000-8000-000000000001" } : { kind, nfcTag: "tag" });
  const result: Awaited<ReturnType<typeof handler>> = await handler(EVENT);
  expect(result.success).toBe(true);
  if (result.success) { expect(result.data.memberDetails).toMatchObject({ email: null, login: null, nfcTag: null, fingerprintId: null }); expect(result.data.logs).toEqual([]); }
  expect(mocks.eq).toHaveBeenCalledWith("member_id", "00000000-0000-4000-8000-000000000001");
  expect(mocks.attendance).toHaveBeenCalledWith(MEMBER);
 });
 it("preserves compact UUID QR cards", async (): Promise<void> => {
  mocks.body.mockResolvedValue({ kind: "guid", memberGuid: "00000000000040008000000000000001" });
  expect(await handler(EVENT)).toMatchObject({ success: true });
  expect(mocks.guid).toHaveBeenCalledWith(EVENT, "00000000-0000-4000-8000-000000000001");
 });
 it("rejects malformed QR identifiers before attendance", async (): Promise<void> => {
  mocks.body.mockResolvedValue({ kind: "guid", memberGuid: "not-an-id" });
  await expect(handler(EVENT)).rejects.toMatchObject({ statusCode: 400 }); expect(mocks.attendance).not.toHaveBeenCalled();
 });
 it("rejects an expired cookie before reading credentials or writing attendance", async (): Promise<void> => {
  mocks.cookie.mockRejectedValue({ statusCode: 401 }); await expect(handler(EVENT)).rejects.toMatchObject({ statusCode: 401 }); expect(mocks.body).not.toHaveBeenCalled(); expect(mocks.attendance).not.toHaveBeenCalled();
 });
 it("rejects cross-origin requests before checking the cookie", async (): Promise<void> => {
  mocks.origin.mockImplementation((): never => { throw Object.assign(new Error(), { statusCode: 403 }); }); await expect(handler(EVENT)).rejects.toMatchObject({ statusCode: 403 }); expect(mocks.cookie).not.toHaveBeenCalled();
 });
 it("rejects invalid action schemas with 400", async (): Promise<void> => {
  mocks.body.mockResolvedValue({ kind: "password", username: "coder", password: "abc" }); await expect(handler(EVENT)).rejects.toMatchObject({ statusCode: 400 }); expect(mocks.attendance).not.toHaveBeenCalled();
 });
 it.each([{ deleted: true }, { isNinja: false }])("rejects ineligible kiosk targets %j", async (change: object): Promise<void> => {
  mocks.password.mockResolvedValue({ member: { ...MEMBER, ...change } }); expect(await handler(EVENT)).toMatchObject({ success: false }); expect(mocks.attendance).not.toHaveBeenCalled();
 });
 it("does not create attendance for failed credentials or leak internal errors", async (): Promise<void> => {
  mocks.password.mockRejectedValue(new Error("secret database detail")); expect(await handler(EVENT)).toEqual({ success: false, error: "Unable to sign in", logs: [] }); expect(mocks.attendance).not.toHaveBeenCalled();
 });
});
