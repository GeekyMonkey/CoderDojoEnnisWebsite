import { beforeEach, describe, expect, it, vi } from "vitest";
import { withMergedProfileImages } from "./memberMergeImages";
import type { VerifiedMember } from "./requestMember";
import { memberToRecord, type MemberModel } from "#shared/types/models/MemberModel";
import { reviewedMemberMerge, type MemberMerge } from "#shared/types/MemberMerge";
import { FormatBucketFileName } from "#shared/types/Supabase";

const KEEP: string = "00000000-0000-4000-8000-000000000002";
const DUPLICATE: string = "00000000-0000-4000-8000-000000000003";
const files: Map<string, Blob> = new Map();
const upload: ReturnType<typeof vi.fn> = vi.fn();
const download: ReturnType<typeof vi.fn> = vi.fn();
const remove: ReturnType<typeof vi.fn> = vi.fn();
const read: ReturnType<typeof vi.fn> = vi.fn();
const commit: ReturnType<typeof vi.fn> = vi.fn();
let body: MemberMerge;
let actor: VerifiedMember;
/** Build complete public snapshots used by the merge route. */
function account(id: string): MemberModel {
 return { id, isNinja: true, isMentor: false, isParent: false, deleted: false, birthYear: null, email: null, fingerprintId: null, nfcTag: null, gardaVetted: false, githubLogin: null, goalLongTerm: null, goalShortTerm: null, hasAvatar: true, hasPhoto: true, login: id, loginDate: null, loginDatePrevious: null, nameFirst: "Coder", nameLast: "Example", phone: null, registeredCurrentTerm: false, scratchName: null, teamId: null, xboxGamertag: null };
}
/** Resolve real storage paths used by existing profile readers. */
function path(id: string, folder: string, extension: string = "png"): string { return `Members/${folder}/${FormatBucketFileName("Member", id, extension)}`; }
beforeEach((): void => {
 vi.resetAllMocks(); files.clear();
 const keep: MemberModel = account(KEEP);
 const duplicate: MemberModel = account(DUPLICATE);
 body = reviewedMemberMerge(keep, duplicate, "keep", {}, { photo: "duplicate", avatar: "keep" })!;
 files.set(path(KEEP, "Photos"), new Blob(["old-photo"], { type: "image/png" }));
 files.set(path(KEEP, "Avatars"), new Blob(["kept-avatar"], { type: "image/png" }));
 files.set(path(DUPLICATE, "Photos"), new Blob(["selected-photo"], { type: "image/png" }));
 files.set(path(DUPLICATE, "Avatars"), new Blob(["other-avatar"], { type: "image/png" }));
 download.mockImplementation(async (name: string): Promise<object> => ({ data: files.get(name) ?? null, error: files.has(name) ? null : { statusCode: "404" } }));
 upload.mockImplementation(async (name: string, blob: Blob): Promise<object> => { files.set(name, blob); return { error: null }; });
 remove.mockImplementation(async (names: string[]): Promise<object> => { for (const name of names) files.delete(name); return { error: null }; });
 read.mockResolvedValue({ data: [memberToRecord(keep), memberToRecord(duplicate)], error: null });
 commit.mockResolvedValue({ id: KEEP });
 actor = { id: "00000000-0000-4000-8000-000000000001", member: { isMentor: true }, client: { storage: { from: (): object => ({ download, upload, remove }) }, schema: (): object => ({ from: (): object => ({ select: (): object => ({ in: (): object => ({ eq: read }) }) }) }) } } as unknown as VerifiedMember;
});
describe("reviewed merge images", (): void => {
 it("copies the selected Photo, keeps the independent Avatar and preserves source files", async (): Promise<void> => {
  const source: Blob = files.get(path(DUPLICATE, "Photos"))!;
  expect(await withMergedProfileImages(actor, body, commit)).toEqual({ id: KEEP });
  expect(files.get(path(KEEP, "Photos"))).toBe(source);
  expect(await files.get(path(KEEP, "Avatars"))!.text()).toBe("kept-avatar");
  expect(files.get(path(DUPLICATE, "Photos"))).toBe(source);
  expect(commit).toHaveBeenCalledOnce();
 });
 it("preserves legacy JPG bytes and removes a stale destination PNG", async (): Promise<void> => {
  files.delete(path(DUPLICATE, "Photos"));
  files.set(path(DUPLICATE, "Photos", "jpg"), new Blob(["legacy"], { type: "image/jpeg" }));
  await withMergedProfileImages(actor, body, commit);
  expect(files.has(path(KEEP, "Photos"))).toBe(false);
  expect(await files.get(path(KEEP, "Photos", "jpg"))!.text()).toBe("legacy");
 });
 it("restores destination files when the guarded database merge rejects", async (): Promise<void> => {
  const before: Map<string, Blob> = new Map(files);
  commit.mockRejectedValue(new Error("Accounts changed; review again"));
  await expect(withMergedProfileImages(actor, body, commit)).rejects.toThrow("Accounts changed");
  expect(files).toEqual(before);
 });
 it("restores both slots after a partial storage failure and never commits", async (): Promise<void> => {
  body.images.avatar = "duplicate";
  const before: Map<string, Blob> = new Map(files);
  upload.mockImplementationOnce(async (name: string, blob: Blob): Promise<object> => { files.set(name, blob); return { error: null }; }).mockResolvedValueOnce({ error: new Error("offline") });
  await expect(withMergedProfileImages(actor, body, commit)).rejects.toMatchObject({ statusCode: 503 });
  expect(files).toEqual(before); expect(commit).not.toHaveBeenCalled();
 });
 it("rejects stale previews before touching storage", async (): Promise<void> => {
  body.expectedDuplicate.email = "changed@example.invalid";
  await expect(withMergedProfileImages(actor, body, commit)).rejects.toMatchObject({ statusCode: 409 });
  expect(download).not.toHaveBeenCalled(); expect(commit).not.toHaveBeenCalled();
 });
 it("rejects a missing selected image before changing the destination", async (): Promise<void> => {
  files.delete(path(DUPLICATE, "Photos"));
  await expect(withMergedProfileImages(actor, body, commit)).rejects.toMatchObject({ statusCode: 409 });
  expect(upload).not.toHaveBeenCalled(); expect(commit).not.toHaveBeenCalled();
 });
 it("reports failed recovery", async (): Promise<void> => {
  upload.mockResolvedValue({ error: new Error("offline") });
  await expect(withMergedProfileImages(actor, body, commit)).rejects.toThrow("recovery failed");
  expect(commit).not.toHaveBeenCalled();
 });
});
