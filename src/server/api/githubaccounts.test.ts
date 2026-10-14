import { beforeEach, describe, expect, it, vi } from "vitest";
import type { H3Event } from "h3";
import { parsePublicDirectory } from "~/stores/public/usePublicDirectoryStore";
import handler from "./githubaccounts.get";

const mocks = vi.hoisted(() => ({ client: vi.fn(), select: vi.fn(), eq: vi.fn(), or: vi.fn(), not: vi.fn(), neq: vi.fn(), order: vi.fn(), header: vi.fn() }));
vi.mock("#server/db/DatabaseClient", (): object => ({ GetSupabaseAdminClient: mocks.client }));
vi.mock("h3", async (importOriginal): Promise<object> => ({ ...await importOriginal<typeof import("h3")>(), setResponseHeader: mocks.header }));
const EVENT: H3Event = {} as H3Event;
const CODER: object = { name_first: "Mary Jane", name_last: "Smith", github_login: "mary", is_ninja: true, is_mentor: false };

// Set the final ordered database query result without contacting a remote site.
function setResult(data: object[] | null, error: object | null = null): void {
 const query: object = { eq: mocks.eq, or: mocks.or, not: mocks.not, neq: mocks.neq, order: mocks.order };
 mocks.select.mockReturnValue(query); mocks.eq.mockReturnValue(query); mocks.or.mockReturnValue(query);
 mocks.not.mockReturnValue(query); mocks.neq.mockReturnValue(query);
 mocks.order.mockReset().mockReturnValueOnce(query).mockReturnValueOnce(query).mockResolvedValue({ data, error });
 mocks.client.mockResolvedValue({ schema: (): object => ({ from: (): object => ({ select: mocks.select }) }) });
}

beforeEach((): void => { vi.clearAllMocks(); setResult([CODER]); });
describe("public GitHub directory", (): void => {
 it("returns the two-list public contract with no private fields", async (): Promise<void> => {
  setResult([{ ...CODER, email: "private", password_hash: "secret" }, { name_first: "Mentor", name_last: "One", github_login: "mentor", is_ninja: false, is_mentor: true }]);
  expect(await handler(EVENT)).toEqual({ Members: [{ FirstName: "Mary Jane", LastName: "Smith", GithubLogin: "mary" }], Mentors: [{ FirstName: "Mentor", LastName: "One", GithubLogin: "mentor" }] });
  expect(mocks.select).toHaveBeenCalledWith("name_first,name_last,github_login,is_ninja,is_mentor");
  expect(mocks.eq).toHaveBeenCalledWith("deleted", false);
  expect(mocks.or).toHaveBeenCalledWith("is_ninja.eq.true,is_mentor.eq.true");
  expect(mocks.not).toHaveBeenCalledWith("github_login", "is", null);
  expect(mocks.neq).toHaveBeenCalledWith("github_login", "");
  expect(mocks.order.mock.calls).toEqual([["name_first", { ascending: true }], ["name_last", { ascending: true }], ["id", { ascending: true }]]);
  expect(mocks.header).toHaveBeenCalledWith(EVENT, "Cache-Control", "public, max-age=300");
 });
 it("omits empty handles and parent-only accounts; includes dual roles in both lists", async (): Promise<void> => {
  setResult([{ ...CODER, github_login: "  " }, { ...CODER, github_login: null }, { ...CODER, is_ninja: false }, { ...CODER, is_mentor: true }]);
  const result: unknown = await handler(EVENT);
  expect(result).toEqual({ Members: [{ FirstName: "Mary Jane", LastName: "Smith", GithubLogin: "mary" }], Mentors: [{ FirstName: "Mary Jane", LastName: "Smith", GithubLogin: "mary" }] });
 });
 it("returns empty arrays when no eligible accounts exist", async (): Promise<void> => {
  setResult([]); expect(await handler(EVENT)).toEqual({ Members: [], Mentors: [] });
 });
 it.each(["missing client", "query error", "missing data"])("fails explicitly on %s without success caching", async (failure: string): Promise<void> => {
  if (failure === "missing client") mocks.client.mockResolvedValue(null);
  else setResult(null, failure === "query error" ? { message: "private database detail" } : null);
  await expect(handler(EVENT)).rejects.toMatchObject({ statusCode: 503, statusMessage: "GitHub directory unavailable" });
  expect(mocks.header).not.toHaveBeenCalled();
 });
 it("feeds the Vue directory store through the same raw public contract", async (): Promise<void> => {
  const response: unknown = await handler(EVENT);
  expect(parsePublicDirectory(response)).toEqual({
   Members: [{ FirstName: "Mary Jane", LastName: "Smith", GithubLogin: "mary" }], Mentors: [],
  });
 });
});
