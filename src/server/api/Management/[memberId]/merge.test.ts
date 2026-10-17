import { beforeEach, describe, expect, it, vi } from "vitest";
import type { H3Event } from "h3";
import { reviewedMemberMerge, type MemberMerge } from "#shared/types/MemberMerge";
import { memberToRecord, type MemberModel } from "#shared/types/models/MemberModel";

const mocks: { actor: ReturnType<typeof vi.fn>; body: ReturnType<typeof vi.fn>; id: ReturnType<typeof vi.fn>; rpc: ReturnType<typeof vi.fn>; images: ReturnType<typeof vi.fn> } = vi.hoisted(() => ({ actor: vi.fn(), body: vi.fn(), id: vi.fn(), rpc: vi.fn(), images: vi.fn() }));
vi.mock("#server/utils/maintenanceRequest", (): object => ({ maintenanceActor: mocks.actor, maintenanceBody: mocks.body, maintenanceId: mocks.id }));
vi.mock("#server/utils/memberMergeImages", (): object => ({ withMergedProfileImages: mocks.images }));
import handler from "./merge.post";

/** Construct a fully populated preview DTO. */
function account(id: string, email: string): MemberModel {
 return { id, isNinja: true, isMentor: false, isParent: false, deleted: false, birthYear: null, email, fingerprintId: null, nfcTag: null, gardaVetted: false, githubLogin: null, goalLongTerm: null, goalShortTerm: null, hasAvatar: true, hasPhoto: true, login: id, loginDate: null, loginDatePrevious: null, nameFirst: "Coder", nameLast: "Example", phone: null, registeredCurrentTerm: false, scratchName: null, teamId: null, xboxGamertag: null };
}
let body: MemberMerge;
beforeEach((): void => {
 vi.resetAllMocks();
 const first: MemberModel = account("00000000-0000-4000-8000-000000000002", "first@example.invalid");
 const second: MemberModel = account("00000000-0000-4000-8000-000000000003", "second@example.invalid");
 body = reviewedMemberMerge(first, second, "duplicate", { email: "keep" }, { photo: "keep", avatar: "duplicate" })!;
 mocks.actor.mockResolvedValue({ id: "actor", client: { schema: (): object => ({ rpc: mocks.rpc }) } });
 mocks.body.mockResolvedValue(body); mocks.id.mockReturnValue(second.id);
 mocks.images.mockImplementation(async (_actor: unknown, _body: unknown, commit: () => Promise<unknown>): Promise<unknown> => commit());
 mocks.rpc.mockResolvedValue({ data: memberToRecord(second), error: null });
});
describe("reviewed merge API", (): void => {
 it("binds the selected username to the survivor and applies reviewed field and image flags", async (): Promise<void> => {
  await handler({} as H3Event);
  expect(mocks.rpc).toHaveBeenCalledWith("merge_members", expect.objectContaining({ p_keep: body.expectedKeep.id, p_duplicate: body.expectedDuplicate.id, p_fields: expect.objectContaining({ email: "first@example.invalid", has_photo: true, has_avatar: true }) }));
  expect(mocks.images).toHaveBeenCalledWith(expect.anything(), body, expect.any(Function));
 });
 it("rejects a survivor URL that disagrees with the selected account", async (): Promise<void> => {
  mocks.id.mockReturnValue(body.duplicateId);
  await expect(handler({} as H3Event)).rejects.toMatchObject({ statusCode: 400 });
  expect(mocks.images).not.toHaveBeenCalled(); expect(mocks.rpc).not.toHaveBeenCalled();
 });
 it("propagates merge conflicts through the image recovery wrapper", async (): Promise<void> => {
  mocks.rpc.mockResolvedValue({ data: null, error: { code: "P0001", message: "Accounts changed; review again" } });
  await expect(handler({} as H3Event)).rejects.toMatchObject({ statusCode: 409 });
 });
});
