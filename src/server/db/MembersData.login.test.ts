import { beforeEach, describe, expect, it, vi } from "vitest";
import type { H3Event } from "h3";
import { MembersData } from "./MembersData";

const mocks = vi.hoisted(() => ({ client: vi.fn(), ilike: vi.fn(), eq: vi.fn() }));
vi.mock("./DatabaseClient", (): object => ({ GetSupabaseAdminClient: mocks.client }));
vi.mock("../utils/authUtils", (): object => ({ GeneratePasswordHash: vi.fn() }));
const EVENT: H3Event = {} as H3Event;

beforeEach((): void => {
 vi.clearAllMocks();
 const query: object = { ilike: mocks.ilike, eq: mocks.eq };
 mocks.ilike.mockReturnValue(query);
 mocks.eq.mockResolvedValue({ data: [], error: null });
 mocks.client.mockResolvedValue({ schema: (): object => ({ from: (): object => ({ select: (): object => query }) }) });
});

describe("login name queries", (): void => {
 it("queries complete name fields as literal patterns and excludes archived rows", async (): Promise<void> => {
  await MembersData.GetMembersByLoginFirstLast(EVENT, "mary_jane%", "o\\neill");
  expect(mocks.ilike).toHaveBeenNthCalledWith(1, "name_first", "mary\\_jane\\%");
  expect(mocks.ilike).toHaveBeenNthCalledWith(2, "name_last", "o\\\\neill");
  expect(mocks.eq).toHaveBeenCalledWith("deleted", false);
 });
 it("propagates query errors instead of silently dropping matching accounts", async (): Promise<void> => {
  mocks.eq.mockResolvedValue({ data: null, error: { message: "query failed" } });
  await expect(MembersData.GetMembersByLoginFirstLast(EVENT, "mary jane", "smith")).rejects.toThrow("Error fetching members by login first and last name");
 });
});
