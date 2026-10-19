import type { MemberModel } from "./models/MemberModel";
export type MemberImageSubject = Pick<MemberModel, "id" | "nameFirst" | "nameLast" | "hasPhoto" | "hasAvatar" | "isMentor" | "isNinja" | "isParent"> & { login?: string | null };

export type MemberImageMode = "PHOTO_INITIALS" | "AVATAR_INITIALS" | "PHOTO_AVATAR_INITIALS";
