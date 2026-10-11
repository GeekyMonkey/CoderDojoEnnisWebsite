import type { MemberModel } from "#shared/types/models/MemberModel";
import { useSectionDraft } from "./useSectionDraft";
/** Preserve member drafts with the shared realtime section protection. */
export function useMemberSectionDraft<T extends object>(member: () => MemberModel, snapshot: (value: MemberModel) => T): ReturnType<typeof useSectionDraft<T, MemberModel>> { return useSectionDraft(member, snapshot); }
