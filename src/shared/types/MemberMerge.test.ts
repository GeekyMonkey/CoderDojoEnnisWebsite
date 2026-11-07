import { describe, expect, it } from "vitest";
import { MERGE_FIELDS, reviewedMemberMerge, automaticMergeSource, MemberMergeSchema, type MergeChoices, type MergeImages, type MemberMerge } from "./MemberMerge";
import type { MemberModel } from "./models/MemberModel";

/** Supply complete snapshots without credentials. */
function mergeAccount(id: string, changes: Partial<MemberModel> = {}): MemberModel {
 return { id, isNinja: true, isMentor: false, isParent: false, deleted: false, birthYear: null, email: null, fingerprintId: null, nfcTag: null, gardaVetted: false, githubLogin: null, goalLongTerm: null, goalShortTerm: null, hasAvatar: false, hasPhoto: false, login: id, loginDate: null, loginDatePrevious: null, nameFirst: "Coder", nameLast: "Example", phone: null, registeredCurrentTerm: false, scratchName: null, teamId: null, xboxGamertag: null, ...changes };
}
const FIRST: MemberModel = mergeAccount("00000000-0000-4000-8000-000000000002", { email: "one@example.invalid", hasPhoto: true, hasAvatar: true });
const SECOND: MemberModel = mergeAccount("00000000-0000-4000-8000-000000000003", { email: "two@example.invalid", hasPhoto: true, hasAvatar: true });
const IMAGES: MergeImages = { photo: "keep", avatar: "duplicate" };

describe("explicit merge review", (): void => {
 it("requires a username even when profile values match", (): void => {
  expect(reviewedMemberMerge(FIRST, { ...FIRST, id: SECOND.id }, null, {}, IMAGES)).toBeNull();
 });
 it("requires review when both differing values are populated", (): void => {
  for (const field of MERGE_FIELDS.filter((field): boolean => field !== "registeredCurrentTerm")) {
   const first: MemberModel = { ...FIRST, [field]: ["birthYear", "fingerprintId"].includes(field) ? 2000 : field === "gardaVetted" ? false : "first" };
   const other: MemberModel = { ...first, id: SECOND.id, [field]: ["birthYear", "fingerprintId"].includes(field) ? 2001 : field === "gardaVetted" ? true : "second" };
   expect(reviewedMemberMerge(first, other, "keep", {}, IMAGES)).toBeNull();
  }
 });
 it.each([null, "", "   "])("automatically keeps a populated value against %s in either direction", (blank: string | null): void => {
  const first: MemberModel = { ...FIRST, email: blank };
  const other: MemberModel = { ...SECOND };
  expect(automaticMergeSource(first, other, "email")).toBe("duplicate");
  expect(automaticMergeSource(other, first, "email")).toBe("keep");
  expect(reviewedMemberMerge(first, other, "duplicate", {}, IMAGES)?.choices.email).toBe("keep");
 });
 it.each([[false, true], [true, false], [true, true], [false, false]])("combines registration %s and %s regardless of reviewed choice", (firstFlag: boolean, secondFlag: boolean): void => {
  const first: MemberModel = { ...FIRST, registeredCurrentTerm: firstFlag };
  const other: MemberModel = { ...first, id: SECOND.id, registeredCurrentTerm: secondFlag };
  for (const survivor of ["keep", "duplicate"] as const) {
   const request: MemberMerge = reviewedMemberMerge(first, other, survivor, { registeredCurrentTerm: "keep" }, IMAGES)!;
   const selected: MemberModel = request.choices.registeredCurrentTerm === "keep" ? request.expectedKeep : request.expectedDuplicate;
   expect(selected.registeredCurrentTerm).toBe(firstFlag || secondFlag);
  }
 });
 it("automatically selects the account with a non-blank username", (): void => {
  const first: MemberModel = { ...FIRST, login: null };
  const other: MemberModel = { ...first, id: SECOND.id, login: "username" };
  expect(reviewedMemberMerge(first, other, null, {}, IMAGES)?.expectedKeep.id).toBe(other.id);
 });
 it("requires separate image choices even when both presence flags match", (): void => {
  expect(reviewedMemberMerge(FIRST, SECOND, "keep", { email: "keep" })).toBeNull();
  expect(reviewedMemberMerge(FIRST, SECOND, "keep", { email: "keep" }, { photo: "keep" })).toBeNull();
 });
 it("maps every field and image choice when the second username survives", (): void => {
  const result: MemberMerge | null = reviewedMemberMerge(FIRST, SECOND, "duplicate", { email: "keep" }, IMAGES);
  expect(result).toMatchObject({ expectedKeep: { id: SECOND.id }, expectedDuplicate: { id: FIRST.id }, duplicateId: FIRST.id, choices: { email: "duplicate" }, images: { photo: "duplicate", avatar: "keep" } });
 });
 it("retains single existing images independently of the surviving username", (): void => {
  const first: MemberModel = { ...FIRST, hasAvatar: false };
  const second: MemberModel = { ...SECOND, hasPhoto: false };
  expect(reviewedMemberMerge(first, second, "duplicate", { email: "duplicate" })).toMatchObject({ images: { photo: "duplicate", avatar: "keep" } });
 });
 it("accepts empty slots and rejects choosing an absent image", (): void => {
  const first: MemberModel = { ...FIRST, hasPhoto: false, hasAvatar: false };
  const second: MemberModel = { ...SECOND, hasPhoto: false, hasAvatar: false };
  const request: MemberMerge | null = reviewedMemberMerge(first, second, "keep", { email: "keep" });
  expect(request?.images).toEqual({ photo: "none", avatar: "none" });
  expect(MemberMergeSchema.safeParse({ ...request, images: { photo: "duplicate", avatar: "none" } }).success).toBe(false);
 });
 it("rejects missing field decisions at the API boundary", (): void => {
  const request: MemberMerge | null = reviewedMemberMerge(FIRST, SECOND, "keep", { email: "keep" }, IMAGES);
  const choices: Partial<MergeChoices> = { ...request!.choices };
  delete choices.email;
  expect(MemberMergeSchema.safeParse({ ...request, choices }).success).toBe(false);
 });
});
