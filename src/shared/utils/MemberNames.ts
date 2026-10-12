import type { MemberModel } from "../types/models/MemberModel";
/** Order people by first name, surname and identity for stable realtime lists. */
export function compareMemberNames(a: MemberModel, b: MemberModel): number {
 return (a.nameFirst ?? "").localeCompare(b.nameFirst ?? "") || (a.nameLast ?? "").localeCompare(b.nameLast ?? "") || a.id.localeCompare(b.id);
}
