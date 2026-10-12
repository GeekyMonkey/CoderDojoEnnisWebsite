import { beforeEach, describe, expect, it, vi } from "vitest";
import type { H3Event } from "h3";
import middleware from "./legacyPrivateReads";

const mocks = vi.hoisted(() => ({ url: vi.fn(), mentor: vi.fn() }));
vi.mock("h3", async (original): Promise<unknown> => ({ ...await original<object>(), getRequestURL: mocks.url }));
vi.mock("#server/utils/requestMentor", (): object => ({ requireRequestMentor: mocks.mentor }));
const EVENT: H3Event = {} as H3Event;

beforeEach((): void => { vi.resetAllMocks(); mocks.mentor.mockResolvedValue({id:"verified"}); });
describe("legacy private read boundary", (): void => {
 it.each(["/api/members/list", "/api/memberBelts/list", "/api/memberBelts/byMemberId", "/api/memberBelts/latest", "/api/memberBelts/pending", "/api/teams/list", "/api/MemberAttendance/SessionDate", "/api/MemberAttendance/SessionDates", "/api/MemberAttendance/SessionStats"])("requires current mentor authority for %s", async (path: string): Promise<void> => {
  mocks.url.mockReturnValue(new URL(`https://example.test${path}`));
  mocks.mentor.mockRejectedValue({statusCode:403});
  await expect(middleware(EVENT)).rejects.toMatchObject({statusCode:403});
 });
 it.each(["/api/Legacy/CopyData", "/api/Legacy/Teams", "/api/Profile", "/api/Parent/children", "/api/Auth/Login", "/api/MemberAttendance/SignInNfcTag"])("preserves separately guarded/deferred flow %s", async (path: string): Promise<void> => {
  mocks.url.mockReturnValue(new URL(`https://example.test${path}`));
  await middleware(EVENT); expect(mocks.mentor).not.toHaveBeenCalled();
 });
});
