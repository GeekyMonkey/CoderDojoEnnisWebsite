import { beforeEach, describe, expect, it, vi } from "vitest";
import { ref } from "vue";
import type { MemberIdentity } from "#shared/types/MemberIdentity";
import type { BeltModel } from "#shared/types/models/BeltModel";
import type { AchievementReview } from "#shared/types/AchievementReview";
import { useProfileCurrentBeltStore } from "./useProfileCurrentBeltStore";

type Options = { queryFn: (context: { signal: AbortSignal }) => Promise<BeltModel | null> };
const mocks = vi.hoisted(() => ({ identity: vi.fn(), fetch: vi.fn(), options: null as Options | null, invalidate: vi.fn(), refetch: vi.fn() }));
vi.mock("@tanstack/vue-query", (): object => ({ useQuery: (options: Options): object => { mocks.options = options; return { data: ref(null), refetch: mocks.refetch }; } }));
vi.mock("./useAuthStore", (): object => ({ useAuthStore: (): object => ({ getIdentity: mocks.identity }) }));
vi.mock("~/composables/useProfileAuthorization", (): object => ({ useProfileAuthorization: (): object => async (): Promise<object> => ({ Authorization: "Bearer verified-session" }) }));
vi.mock("~/composables/UseSupabaseRealtimeTable", (): object => ({ UseSupabaseRealtimeTable: mocks.invalidate }));
const OWN: string = "00000000-0000-4000-8000-000000000001";
const OTHER: string = "00000000-0000-4000-8000-000000000002";
const BELT: BeltModel = { id: OWN, deleted: false, color: "White", hexCode: "#ffffff", description: "Earned", sortOrder: 1 };
const REVIEW: AchievementReview = { id: "review", definitionId: OWN, definitionDeleted: false, goalDate: null, memberId: OWN, memberName: "Coder", kind: "belt", categoryId: null, categoryName: null, label: "White", sortOrder: 1, belt: BELT, description: "", applicationDate: null, applicationNotes: null, awarded: 1, awardedNotes: null, awardedByAdultId: null, rejectedDate: null, rejectedNotes: null, rejectedByAdultId: null };

/** Execute the query with a controlled current identity and request context. */
async function load(actor: MemberIdentity, target: string = OWN): Promise<BeltModel | null> {
 mocks.identity.mockResolvedValue(actor);
 useProfileCurrentBeltStore(target);
 if (!mocks.options) throw new Error("Query not registered");
 return mocks.options.queryFn({ signal: new AbortController().signal });
}

beforeEach((): void => {
 vi.clearAllMocks();
 vi.stubGlobal("useSupabaseUser", (): object => ref({ id: "auth-user" }));
 vi.stubGlobal("$fetch", mocks.fetch);
 mocks.fetch.mockResolvedValue({ success: true, data: [REVIEW] });
});
describe("scoped profile belt reads", (): void => {
 it("uses the own coder API without requesting any directory", async (): Promise<void> => {
  await expect(load({ id: OWN, isMentor: false, isParent: false, isNinja: true })).resolves.toEqual(BELT);
  expect(mocks.fetch).toHaveBeenCalledOnce();
  expect(mocks.fetch).toHaveBeenCalledWith("/api/Coder/achievements/belt", expect.objectContaining({ query: {}, headers: { Authorization: "Bearer verified-session" } }));
 });
 it("uses guarded member history for a mentor", async (): Promise<void> => {
  await load({ id: OTHER, isMentor: true, isParent: false, isNinja: false });
  expect(mocks.fetch).toHaveBeenCalledWith("/api/Achievements/History", expect.objectContaining({ query: { kind: "belt", memberId: OWN } }));
 });
 it.each([{ id: OTHER, isMentor: false, isParent: false, isNinja: true }, { id: OWN, isMentor: false, isParent: true, isNinja: false }])("does not fetch a private history outside supported profile scope", async (actor: MemberIdentity): Promise<void> => {
  await expect(load(actor)).rejects.toThrow("Profile access required");
  expect(mocks.fetch).not.toHaveBeenCalled();
 });
 it("selects the latest earned belt, excluding pending and other-member rows", async (): Promise<void> => {
  mocks.fetch.mockResolvedValue({ success: true, data: [REVIEW, { ...REVIEW, memberId: OTHER, awarded: 100 }, { ...REVIEW, awarded: null }, { ...REVIEW, awarded: 10, belt: { ...BELT, color: "Yellow" } }] });
  await expect(load({ id: OWN, isMentor: false, isParent: false, isNinja: true })).resolves.toMatchObject({ color: "Yellow" });
 });
 it("propagates authorization denial without falling back to a directory", async (): Promise<void> => {
  mocks.fetch.mockRejectedValue({ statusCode: 403 });
  await expect(load({ id: OWN, isMentor: false, isParent: false, isNinja: true })).rejects.toMatchObject({ statusCode: 403 });
  expect(mocks.fetch).toHaveBeenCalledOnce();
 });
});
