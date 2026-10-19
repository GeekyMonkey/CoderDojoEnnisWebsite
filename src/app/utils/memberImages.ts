import type { MemberImageMode, MemberImageSubject } from "#shared/types/MemberPresentation";

export type MemberImageKind = "photo" | "avatar";
export type MemberImageCandidate = { kind: MemberImageKind; url: string };
const IMAGE_ORDER: Record<MemberImageMode, readonly MemberImageKind[]> = {
	PHOTO_INITIALS: ["photo"],
	AVATAR_INITIALS: ["avatar"],
	PHOTO_AVATAR_INITIALS: ["photo", "avatar"],
};

/** Keep the display shape tied to the requested preference, including fallbacks. */
export function memberImageIsRound(mode: MemberImageMode): boolean {
	return mode !== "AVATAR_INITIALS";
}

/** Resolve available images in preference order, trying PNG then legacy JPEG. */
export function memberImageCandidates(
	member: Pick<MemberImageSubject, "hasPhoto" | "hasAvatar">,
	mode: MemberImageMode,
	photoUrl: string,
	avatarUrl: string,
	revision: string,
): MemberImageCandidate[] {
	return IMAGE_ORDER[mode].flatMap((kind: MemberImageKind): MemberImageCandidate[] => {
		if (!(kind === "photo" ? member.hasPhoto : member.hasAvatar)) return [];
		const original: string = kind === "photo" ? photoUrl : avatarUrl;
		const urls: string[] = [...new Set([original.replace(/\.jpg(?=\?|$)/, ".png"), original])];
		return urls.map((url: string): MemberImageCandidate => ({ kind, url: `${url}${url.includes("?") ? "&" : "?"}v=${encodeURIComponent(revision)}` }));
	});
}
