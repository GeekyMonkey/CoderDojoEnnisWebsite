import { describe, expect, it } from "vitest";
import type { MemberImageMode } from "#shared/types/MemberPresentation";
import { memberImageCandidates, memberImageIsRound, type MemberImageCandidate } from "./memberImages";

const PHOTO_URL: string = "https://example.test/photo.jpg";
const AVATAR_URL: string = "https://example.test/avatar.jpg";

describe("member image preferences", (): void => {
	it.each([
		["PHOTO_INITIALS", ["photo", "photo"]],
		["AVATAR_INITIALS", ["avatar", "avatar"]],
		["PHOTO_AVATAR_INITIALS", ["photo", "photo", "avatar", "avatar"]],
	] as [MemberImageMode, string[]][])("orders image attempts for %s", (mode: MemberImageMode, expected: string[]): void => {
		const candidates: MemberImageCandidate[] = memberImageCandidates({ hasPhoto: true, hasAvatar: true }, mode, PHOTO_URL, AVATAR_URL, "1");
		expect(candidates.map((candidate: MemberImageCandidate): string => candidate.kind)).toEqual(expected);
		expect(candidates[0]?.url).toContain(".png?v=1");
		expect(candidates[1]?.url).toContain(".jpg?v=1");
	});
	it("falls back to the avatar when the preferred photo is absent", (): void => {
		const candidates: MemberImageCandidate[] = memberImageCandidates({ hasPhoto: false, hasAvatar: true }, "PHOTO_AVATAR_INITIALS", PHOTO_URL, AVATAR_URL, "1");
		expect(candidates.map((candidate: MemberImageCandidate): string => candidate.kind)).toEqual(["avatar", "avatar"]);
		expect(memberImageIsRound("PHOTO_AVATAR_INITIALS")).toBe(true);
	});
	it("uses initials rather than an unrequested image", (): void => {
		expect(memberImageCandidates({ hasPhoto: false, hasAvatar: true }, "PHOTO_INITIALS", PHOTO_URL, AVATAR_URL, "1")).toEqual([]);
		expect(memberImageCandidates({ hasPhoto: true, hasAvatar: false }, "AVATAR_INITIALS", PHOTO_URL, AVATAR_URL, "1")).toEqual([]);
	});
	it("uses initials when neither image exists", (): void => {
		expect(memberImageCandidates({ hasPhoto: false, hasAvatar: false }, "PHOTO_AVATAR_INITIALS", PHOTO_URL, AVATAR_URL, "1")).toEqual([]);
	});
	it("keeps avatar mode square and both photo modes circular", (): void => {
		expect(memberImageIsRound("AVATAR_INITIALS")).toBe(false);
		expect(memberImageIsRound("PHOTO_INITIALS")).toBe(true);
		expect(memberImageIsRound("PHOTO_AVATAR_INITIALS")).toBe(true);
	});
});
